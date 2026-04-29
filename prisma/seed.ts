import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users...\n');

  const password = await bcrypt.hash('password123', 12);

  // 1. SuperAdmin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edushare.app' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@edushare.app',
      password,
      role: 'ADMIN',
      isApproved: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email} (role: ${admin.role})`);

  // 2. Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@edushare.app' },
    update: {},
    create: {
      name: 'Demo Teacher',
      email: 'teacher@edushare.app',
      password,
      role: 'TEACHER',
      isApproved: true,
    },
  });
  console.log(`✅ Teacher created: ${teacher.email} (role: ${teacher.role})`);

  // 3. Student
  const student = await prisma.user.upsert({
    where: { email: 'student@edushare.app' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@edushare.app',
      password,
      role: 'STUDENT',
      isApproved: true,
    },
  });
  console.log(`✅ Student created: ${student.email} (role: ${student.role})`);

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials (all use the same password):');
  console.log('   Password: password123');
  console.log('   ─────────────────────────────────');
  console.log('   Admin:   admin@edushare.app');
  console.log('   Teacher: teacher@edushare.app');
  console.log('   Student: student@edushare.app');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
