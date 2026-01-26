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

  // Create lecturers (3 different lecturers)
  const lecturer1 = await prisma.user.create({
    data: {
      name: 'Dr. Budi Santoso',
      email: 'budi@example.com',
      password: hashedPassword,
      role: 'LECTURER',
      phone: '081234567890',
    },
  });
  console.log('✅ Created lecturer 1:', lecturer1.name);

  const lecturer2 = await prisma.user.create({
    data: {
      name: 'Prof. Siti Nurhaliza',
      email: 'siti@example.com',
      password: hashedPassword,
      role: 'LECTURER',
      phone: '082345678901',
    },
  });
  console.log('✅ Created lecturer 2:', lecturer2.name);

  const lecturer3 = await prisma.user.create({
    data: {
      name: 'Dr. Ahmad Rahman',
      email: 'ahmad@example.com',
      password: hashedPassword,
      role: 'LECTURER',
      phone: '083456789012',
    },
  });
  console.log('✅ Created lecturer 3:', lecturer3.name);

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

  // Create example course (Web Development Basics) - Lecturer 1
  const course = await prisma.course.create({
    data: {
      title: 'Web Development Basics',
      description: 'Dasar-dasar web development dengan HTML, CSS, JavaScript',
      code: 'WEB-101',
      lecturerId: lecturer1.id,
    },
  });
  console.log(
    '✅ Created course 1:',
    course.title,
    '- Lecturer:',
    lecturer1.name,
  );

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

  // ==========================================
  // COURSE 2: Advanced JavaScript - Lecturer 2
  // ==========================================
  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced JavaScript',
      description:
        'Pelajari async/await, promises, dan design patterns di JavaScript',
      code: 'JS-201',
      lecturerId: lecturer2.id,
    },
  });
  console.log(
    '✅ Created course 2:',
    course2.title,
    '- Lecturer:',
    lecturer2.name,
  );

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course2.id,
      semester: 'Semester 2',
      status: 'active',
    },
  });
  console.log('✅ Enrolled', student.name, 'to', course2.title);

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Implementasi Promise & Async Await',
      description:
        'Buat aplikasi dengan multiple async operations menggunakan Promise dan Async/Await',
      code: 'ASG-ASYNC',
      brief:
        'Implementasikan promise chain dan async/await dalam aplikasi real-world.',
      dueDate: new Date('2026-03-15'),
      courseId: course2.id,
    },
  });
  console.log('✅ Created assignment 2:', assignment2.title);

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Quiz Async JavaScript',
      description: 'Pengujian pemahaman async programming di JavaScript',
      duration: 30,
      courseId: course2.id,
    },
  });
  console.log('✅ Created quiz 2:', quiz2.title);

  await prisma.question.create({
    data: {
      question: 'Apa itu Promise di JavaScript?',
      optionA: 'Fungsi yang mengembalikan hasil dengan delay',
      optionB:
        'Objek yang merepresentasikan penyelesaian atau kegagalan dari operasi asynchronous',
      optionC: 'Variable yang menyimpan data',
      optionD: 'Method untuk memanggil API',
      correctAnswer: 'B',
      order: 1,
      quizId: quiz2.id,
    },
  });

  await prisma.question.create({
    data: {
      question: 'Keyword apa yang digunakan untuk menunggu Promise?',
      optionA: 'wait',
      optionB: 'pause',
      optionC: 'await',
      optionD: 'delay',
      correctAnswer: 'C',
      order: 2,
      quizId: quiz2.id,
    },
  });

  console.log('✅ Created 2 questions for quiz 2');

  // ==========================================
  // COURSE 3: Database Design & SQL - Lecturer 3
  // ==========================================
  const course3 = await prisma.course.create({
    data: {
      title: 'Database Design & SQL',
      description:
        'Desain database relasional dan query SQL untuk aplikasi enterprise',
      code: 'DB-301',
      lecturerId: lecturer3.id,
    },
  });
  console.log(
    '✅ Created course 3:',
    course3.title,
    '- Lecturer:',
    lecturer3.name,
  );

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course3.id,
      semester: 'Semester 3',
      status: 'active',
    },
  });
  console.log('✅ Enrolled', student.name, 'to', course3.title);

  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Desain Database E-Commerce',
      description:
        'Buat skema database lengkap untuk aplikasi e-commerce dengan normalisasi yang tepat',
      code: 'ASG-DB',
      brief:
        'Desain database relasional dengan proper normalization untuk e-commerce platform.',
      dueDate: new Date('2026-04-20'),
      courseId: course3.id,
    },
  });
  console.log('✅ Created assignment 3:', assignment3.title);

  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'Quiz SQL Fundamentals',
      description: 'Pengujian dasar-dasar SQL dan database design',
      duration: 25,
      courseId: course3.id,
    },
  });
  console.log('✅ Created quiz 3:', quiz3.title);

  await prisma.question.create({
    data: {
      question: 'Apa itu Primary Key dalam database?',
      optionA: 'Key yang paling penting',
      optionB: 'Identitas unik yang membedakan setiap record dalam tabel',
      optionC: 'Key untuk enkripsi data',
      optionD: 'Key yang digunakan untuk backups',
      correctAnswer: 'B',
      order: 1,
      quizId: quiz3.id,
    },
  });

  await prisma.question.create({
    data: {
      question: 'JOIN mana yang mengembalikan semua record dari kedua tabel?',
      optionA: 'INNER JOIN',
      optionB: 'LEFT JOIN',
      optionC: 'FULL OUTER JOIN',
      optionD: 'CROSS JOIN',
      correctAnswer: 'C',
      order: 2,
      quizId: quiz3.id,
    },
  });

  console.log('✅ Created 2 questions for quiz 3');

  console.log('\n✅ All example data seeded successfully!');
  console.log('\n📋 Example Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Lecturers (3):');
  console.log('  1. Dr. Budi Santoso');
  console.log('     Email:', lecturer1.email);
  console.log('     Phone:', lecturer1.phone);
  console.log('');
  console.log('  2. Prof. Siti Nurhaliza');
  console.log('     Email:', lecturer2.email);
  console.log('     Phone:', lecturer2.phone);
  console.log('');
  console.log('  3. Dr. Ahmad Rahman');
  console.log('     Email:', lecturer3.email);
  console.log('     Phone:', lecturer3.phone);
  console.log('');
  console.log('Student:');
  console.log('  Email:', student.email);
  console.log('  Password: password123');
  console.log('');
  console.log('(All users password: password123)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📚 Example Courses (3):');
  console.log('');
  console.log('1️⃣  Web Development Basics (WEB-101)');
  console.log('   👨‍🏫 Lecturer: Dr. Budi Santoso');
  console.log('   📝 Assignment: Membuat Halaman Login');
  console.log('   ❓ Quiz: Quiz HTML & CSS Basics');
  console.log('');
  console.log('2️⃣  Advanced JavaScript (JS-201)');
  console.log('   👩‍🏫 Lecturer: Prof. Siti Nurhaliza');
  console.log('   📝 Assignment: Implementasi Promise & Async Await');
  console.log('   ❓ Quiz: Quiz Async JavaScript');
  console.log('');
  console.log('3️⃣  Database Design & SQL (DB-301)');
  console.log('   �‍🏫 Lecturer: Dr. Ahmad Rahman');
  console.log('   �📝 Assignment: Desain Database E-Commerce');
  console.log('   ❓ Quiz: Quiz SQL Fundamentals');
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
