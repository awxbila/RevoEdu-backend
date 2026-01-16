import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const lecturer = await prisma.user.create({
    data: {
      name: 'Prof. John Doe',
      email: 'lecturer@example.com',
      password: hashedPassword,
      role: 'LECTURER',
    },
  });
  console.log('✅ Created lecturer:', lecturer.email);

  const student1 = await prisma.user.create({
    data: {
      name: 'Alice Student',
      email: 'student1@example.com',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });
  console.log('✅ Created student:', student1.email);

  const student2 = await prisma.user.create({
    data: {
      name: 'Bob Student',
      email: 'student2@example.com',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });
  console.log('✅ Created student:', student2.email);

  // Create courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Node.js Fundamentals',
      description: 'Learn Node.js basics and build REST APIs',
      lecturerId: lecturer.id,
    },
  });
  console.log('✅ Created course 1:', course1.title, '(ID:', course1.id, ')');

  const course2 = await prisma.course.create({
    data: {
      title: 'React Advanced',
      description: 'Master React hooks, context, and performance optimization',
      lecturerId: lecturer.id,
    },
  });
  console.log('✅ Created course 2:', course2.title, '(ID:', course2.id, ')');

  // Create enrollments
  await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
    },
  });
  console.log('✅ Enrolled', student1.name, 'to', course1.title);

  await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      courseId: course2.id,
    },
  });
  console.log('✅ Enrolled', student1.name, 'to', course2.title);

  await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      courseId: course1.id,
    },
  });
  console.log('✅ Enrolled', student2.name, 'to', course1.title);

  // Create assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Build a simple REST API',
      description: 'Create a REST API with Express and Node.js',
      courseId: course1.id,
    },
  });
  console.log('✅ Created assignment 1:', assignment1.title);

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Create a React component library',
      description: 'Build reusable React components',
      courseId: course2.id,
    },
  });
  console.log('✅ Created assignment 2:', assignment2.title);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Lecturer:');
  console.log('  Email:', lecturer.email);
  console.log('  Password: password123');
  console.log('');
  console.log('Student 1:');
  console.log('  Email:', student1.email);
  console.log('  Password: password123');
  console.log('');
  console.log('Student 2:');
  console.log('  Email:', student2.email);
  console.log('  Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🎯 Course IDs for testing:');
  console.log('  Course 1 ID:', course1.id);
  console.log('  Course 2 ID:', course2.id);
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
