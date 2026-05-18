import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const p = new PrismaClient();
const h = await bcrypt.hash('Admin@123456!', 12);
await p.user.update({ where: { email: 'admin@example.com' }, data: { passwordHash: h } });
console.log('Password updated!');
await p.$disconnect();