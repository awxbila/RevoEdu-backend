import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============= LECTURER METHODS =============

  async create(dto: CreateQuizDto, lecturerId: number) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenException('Not your course');
    }

    // Create quiz with questions
    return this.prisma.quiz.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        courseId: dto.courseId,
        questions: {
          create: dto.questions.map((q) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            order: q.order,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            order: true,
            // Don't include correctAnswer for security
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findAllByCourse(courseId: number, userId: number, userRole: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId },
      include: {
        _count: {
          select: {
            questions: true,
            submissions: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            lecturerId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (userRole === 'STUDENT') {
      // Include student's submission status
      const quizzesWithStatus = await Promise.all(
        quizzes.map(async (quiz) => {
          const submission = await this.prisma.quizSubmission.findUnique({
            where: {
              quizId_studentId: {
                quizId: quiz.id,
                studentId: userId,
              },
            },
            select: {
              id: true,
              score: true,
              submittedAt: true,
            },
          });

          return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            duration: quiz.duration,
            courseId: quiz.courseId,
            course: quiz.course,
            totalQuestions: quiz._count.questions,
            isCompleted: !!submission,
            submission,
            createdAt: quiz.createdAt,
          };
        }),
      );
      return quizzesWithStatus;
    }

    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      courseId: quiz.courseId,
      course: quiz.course,
      totalQuestions: quiz._count.questions,
      totalSubmissions: quiz._count.submissions,
      createdAt: quiz.createdAt,
    }));
  }

  // List quizzes for a student across enrolled courses
  async findAllForStudent(studentId: number) {
    // Get enrolled course ids
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) return [];

    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        _count: { select: { questions: true } },
        course: { select: { id: true, title: true } },
        submissions: {
          where: { studentId },
          select: { id: true, score: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz) => {
      const submission = quiz.submissions[0];
      // Ambil dueDate manual dari quiz (meski tidak ada di type, field tetap ada di hasil Prisma)
      const dueDate = (quiz as { dueDate?: Date }).dueDate;
      return {
        id: quiz.id,
        title: quiz.title,
        courseId: quiz.courseId,
        courseName: quiz.course.title,
        questionCount: quiz._count.questions,
        isCompleted: !!submission,
        score: submission ? submission.score : null,
        deadline: dueDate,
      };
    });
  }

  async findOne(quizId: string, userId: number, userRole: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            lecturerId: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (userRole === 'STUDENT') {
      // Check if student is enrolled
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: quiz.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }

      // Batasi akses jika sudah lewat dueDate
      if (quiz.dueDate && new Date() > quiz.dueDate) {
        throw new ForbiddenException(
          'Quiz sudah melewati deadline dan tidak bisa dikerjakan',
        );
      }

      // Check if already submitted
      const submission = await this.prisma.quizSubmission.findUnique({
        where: {
          quizId_studentId: {
            quizId,
            studentId: userId,
          },
        },
      });

      // Return questions without correct answers
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        courseId: quiz.courseId,
        course: quiz.course,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          order: q.order,
        })),
        isCompleted: !!submission,
        submission: submission
          ? {
              id: submission.id,
              score: submission.score,
              submittedAt: submission.submittedAt,
            }
          : null,
      };
    }

    // Lecturer can see correct answers
    if (quiz.course.lecturerId !== userId) {
      throw new ForbiddenException('Not your quiz');
    }

    return quiz;
  }

  async update(quizId: string, dto: UpdateQuizDto, lecturerId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('Not your quiz');
    }

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
      },
    });
  }

  async delete(quizId: string, lecturerId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('Not your quiz');
    }

    return this.prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  // ============= STUDENT METHODS =============

  async submitQuiz(quizId: string, dto: SubmitQuizDto, studentId: number) {
    // Get quiz with questions
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        dueDate: true,
        courseId: true,
        questions: {
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctAnswer: true,
            order: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Batasi submit jika sudah lewat dueDate
    if (quiz.dueDate && new Date() > quiz.dueDate) {
      throw new ForbiddenException(
        'Quiz sudah melewati deadline dan tidak bisa dikerjakan',
      );
    }

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: quiz.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.quizSubmission.findUnique({
      where: {
        quizId_studentId: {
          quizId,
          studentId,
        },
      },
    });

    if (existingSubmission) {
      throw new BadRequestException('You have already submitted this quiz');
    }

    // Validate all questions are answered
    const questionIds = quiz.questions.map((q) => q.id);
    const answeredQuestionIds = dto.answers.map((a) => a.questionId);

    const missingQuestions = questionIds.filter(
      (id) => !answeredQuestionIds.includes(id),
    );

    if (missingQuestions.length > 0) {
      throw new BadRequestException('All questions must be answered');
    }

    // Calculate score
    let correctCount = 0;
    const answersData = dto.answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) {
        throw new BadRequestException(
          `Question ${answer.questionId} not found`,
        );
      }
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = (correctCount / totalQuestions) * 100;

    // Create submission
    const submission = await this.prisma.quizSubmission.create({
      data: {
        quizId,
        studentId,
        score,
        correctCount,
        totalQuestions,
        answers: {
          create: answersData,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
              },
            },
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      id: submission.id,
      quiz: submission.quiz,
      score: submission.score,
      correctCount: submission.correctCount,
      totalQuestions: submission.totalQuestions,
      submittedAt: submission.submittedAt,
      answers: submission.answers.map((a) => ({
        question: a.question.question,
        optionA: a.question.optionA,
        optionB: a.question.optionB,
        optionC: a.question.optionC,
        optionD: a.question.optionD,
        selectedAnswer: a.selectedAnswer,
        correctAnswer: a.question.correctAnswer,
        isCorrect: a.isCorrect,
      })),
    };
  }

  // ============= SUBMISSION METHODS =============

  async getQuizSubmissions(quizId: string, lecturerId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('Not your quiz');
    }

    const submissions = await this.prisma.quizSubmission.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
      },
      totalSubmissions: submissions.length,
      submissions,
    };
  }

  async getSubmissionDetail(
    submissionId: string,
    userId: number,
    userRole: string,
  ) {
    const submission = await this.prisma.quizSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quiz: {
          include: {
            course: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
          orderBy: {
            question: {
              order: 'asc',
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Student can only view their own submission
    if (userRole === 'STUDENT' && submission.studentId !== userId) {
      throw new ForbiddenException('Not your submission');
    }

    // Lecturer can only view submissions from their courses
    if (
      userRole === 'LECTURER' &&
      submission.quiz.course.lecturerId !== userId
    ) {
      throw new ForbiddenException('Not your quiz');
    }

    return {
      id: submission.id,
      student: submission.student,
      quiz: {
        id: submission.quiz.id,
        title: submission.quiz.title,
        description: submission.quiz.description,
      },
      score: submission.score,
      correctCount: submission.correctCount,
      totalQuestions: submission.totalQuestions,
      submittedAt: submission.submittedAt,
      answers: submission.answers.map((a) => ({
        question: a.question.question,
        optionA: a.question.optionA,
        optionB: a.question.optionB,
        optionC: a.question.optionC,
        optionD: a.question.optionD,
        selectedAnswer: a.selectedAnswer,
        correctAnswer: a.question.correctAnswer,
        isCorrect: a.isCorrect,
      })),
    };
  }
}
