import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe_Now_123!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Studio Admin',
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin created:', admin.email);
    console.log('⚠️  Password from .env — change it after first login!');
  } else {
    console.log('ℹ️  Admin already exists:', existing.email);
  }

  // مشروع مثال
  const sample = await prisma.project.findUnique({ where: { slug: 'sample-case-study' } });
  if (!sample) {
    await prisma.project.create({
      data: {
        title: 'Sample Case Study',
        slug: 'sample-case-study',
        description:
          'A walkthrough of how we approached a complete brand redesign for an indie publisher.',
        content:
          '<p>This is a placeholder project. From the admin dashboard you can create real ones.</p><h2>Our approach</h2><p>Research, sketches, iteration, ship.</p>',
        tags: ['branding', 'editorial'],
        price: 4900, // $49
        isFeatured: true,
        isPublished: true,
      },
    });
    console.log('✅ Sample project created');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
