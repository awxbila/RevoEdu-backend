import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.quizAnswer.deleteMany();
  await prisma.quizSubmission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared all existing data');

  // Create example data matching Swagger documentation
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create lecturer (Dr. Budi Santoso)
  const lecturer = await prisma.user.create({
    data: {
      name: 'Dr. Budi Santoso',
      email: 'budi@example.com',
      password: hashedPassword,
      role: 'LECTURER',
      phone: '081234567890',
    },
  });
  console.log('✅ Created lecturer:', lecturer.name);

  // Create example student
  const student = await prisma.user.create({
    data: {
      name: 'Student Example',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });
  console.log('✅ Created student:', student.name);

  // Create example course (Web Development Basics)
  const course = await prisma.course.create({
    data: {
      title: 'Web Development Basics',
      description: 'Dasar-dasar web development dengan HTML, CSS, JavaScript',
      code: 'WEB-101',
      lecturerId: lecturer.id,
    },
  });
  console.log('✅ Created course:', course.title);

  // Enroll student to course
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      semester: 'Semester 1',
      status: 'active',
    },
  });
  console.log('✅ Enrolled', student.name, 'to', course.title);

  // Create example assignment (Membuat Halaman Login)
  const assignment = await prisma.assignment.create({
    data: {
      title: 'Membuat Halaman Login',
      description:
        'Buat halaman login dengan email dan password, implementasikan form validation.',
      code: 'ASG-LOGIN',
      brief:
        'Buat halaman login dengan email dan password. Gunakan form validation.',
      dueDate: new Date('2026-02-15'),
      courseId: course.id,
    },
  });
  console.log('✅ Created assignment:', assignment.title);

  // Create example quiz (Quiz HTML & CSS Basics)
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Quiz HTML & CSS Basics',
      description: 'Dasar HTML dan CSS',
      duration: 20,
      courseId: course.id,
    },
  });
  console.log('✅ Created quiz:', quiz.title);

  // Create example questions for the quiz
  await prisma.question.create({
    data: {
      question: 'Apa kepanjangan dari HTML?',
      optionA: 'Hyper Text Markup Language',
      optionB: 'High Tech Markup Language',
      optionC: 'Home Tool Markup Language',
      optionD: 'Hyperlinks and Text Markup Language',
      correctAnswer: 'A',
      order: 1,
      quizId: quiz.id,
    },
  });

  await prisma.question.create({
    data: {
      question: 'CSS singkatan dari?',
      optionA: 'Computer Style Sheets',
      optionB: 'Cascading Style Sheets',
      optionC: 'Creative Style Sheets',
      optionD: 'Colorful Style Sheets',
      correctAnswer: 'B',
      order: 2,
      quizId: quiz.id,
    },
  });

  console.log('✅ Created 2 quiz questions');

  console.log('\n✅ Example data seeded successfully!');
  console.log('\n📋 Example Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Lecturer (Dr. Budi Santoso):');
  console.log('  Email:', lecturer.email);
  console.log('  Password: password123');
  console.log('  Phone:', lecturer.phone);
  console.log('');
  console.log('Student:');
  console.log('  Email:', student.email);
  console.log('  Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📚 Example Course:');
  console.log('  Title:', course.title);
  console.log('  Code:', course.code);
  console.log('  ID:', course.id);
  console.log('');
  console.log('📝 Example Assignment:');
  console.log('  Title:', assignment.title);
  console.log('  Code:', assignment.code);
  console.log('');
  console.log('❓ Example Quiz:');
  console.log('  Title:', quiz.title);
  console.log('  Duration:', quiz.duration, 'minutes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
