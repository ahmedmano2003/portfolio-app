# Atelier — Portfolio Studio

موقع شركة / بورتفوليو متكامل بـ **Next.js 14 + TypeScript + PostgreSQL + Stripe**، مبني من الصفر بحماية كاملة ضد الثغرات الشهيرة.

---

## ✨ المميزات

- 🎨 **Portfolio Showcase** — صفحات مشاريع، featured، tags، البحث
- 👥 **Authentication** — تسجيل دخول/حسابات مستخدمين (Email + Password)
- 🛡️ **Admin Dashboard** — KPIs، إدارة المشاريع، رسائل التواصل
- 💳 **Stripe Payments** — شراء case studies/تقارير (checkout + webhooks)
- 📤 **File Uploads** — رفع صور آمن مع تحويل لـ WebP وفحص magic bytes
- 📨 **Contact Form** — مع honeypot وrate limiting
- 🎭 **Editorial Design** — Fraunces + Manrope، grain texture، marquee

---

## 🔒 الحماية المطبقة

| الثغرة | الحماية |
|--------|---------|
| **SQL Injection** | Prisma ORM (parameterized queries) |
| **XSS** | DOMPurify على المحتوى + CSP headers صارمة |
| **CSRF** | NextAuth tokens + SameSite cookies |
| **Brute Force** | Rate limiting على login (5 محاولات / 15 دقيقة) |
| **Password Cracking** | bcrypt cost=12 + باسورد قوي إجباري (12+ chars) |
| **Session Hijacking** | HttpOnly + Secure + SameSite cookies + JWT |
| **Clickjacking** | X-Frame-Options + frame-ancestors CSP |
| **MIME Sniffing** | X-Content-Type-Options: nosniff |
| **Path Traversal** | basename + verify path startsWith |
| **Malicious Uploads** | Magic bytes detection + sharp re-encoding |
| **Stripe Webhook Spoofing** | HMAC signature verification |
| **Price Tampering** | السعر من DB، مش من client |
| **Timing Attacks** | bcrypt.compare ثابت الوقت |
| **Bot Spam** | Honeypot field + IP rate limiting |
| **Info Disclosure** | X-Powered-By disabled + generic error messages |
| **Insecure Transport** | HSTS preload header |
| **IP Privacy** | SHA-256 hashed IPs (GDPR) |

---

## 🚀 التشغيل

### 1) المتطلبات
- Node.js 18+
- PostgreSQL 14+
- حساب Stripe (للدفع - اختياري في التطوير)

### 2) Setup

```bash
# انسخ المشروع وحط في مجلده
cd portfolio-app

# ثبّت الحزم
npm install

# اعمل ملف env
cp .env.example .env
# عدّل DATABASE_URL و AUTH_SECRET (مهم!)
# generate AUTH_SECRET:
openssl rand -base64 32
```

### 3) قاعدة البيانات

```bash
# أنشئ schema في DB
npm run db:push

# Generate Prisma Client
npx prisma generate

# Seed (يعمل admin user + sample project)
npm run db:seed
```

### 4) Stripe (للدفع)

```bash
# ثبّت Stripe CLI ثم:
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# هتجيب whsec_... حطه في .env كـ STRIPE_WEBHOOK_SECRET
```

### 5) شغل المشروع

```bash
npm run dev
# افتح http://localhost:3000
# سجل دخول كـ admin بالإيميل/الباسورد اللي في .env
```

---

## 📂 هيكل المشروع

```
portfolio-app/
├── prisma/
│   ├── schema.prisma         # DB schema
│   └── seed.ts               # admin + sample data
├── src/
│   ├── app/
│   │   ├── (auth)/           # login + register
│   │   ├── admin/            # ADMIN-only routes
│   │   ├── dashboard/        # user dashboard
│   │   ├── projects/         # public portfolio
│   │   ├── contact/          # contact form
│   │   └── api/              # API routes
│   ├── components/           # UI components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth config
│   │   ├── db.ts             # Prisma client
│   │   ├── rate-limit.ts     # rate limiting
│   │   ├── validations.ts    # Zod schemas
│   │   ├── upload.ts         # secure file upload
│   │   └── utils.ts          # helpers + sanitization
│   └── types/                # TypeScript types
├── middleware.ts             # route protection
├── next.config.js            # security headers + CSP
└── tailwind.config.ts        # editorial theme
```

---

## 🔐 ملاحظات أمان مهمة قبل النشر

1. **غيّر `AUTH_SECRET`** بـ `openssl rand -base64 32`
2. **غيّر باسورد الـ admin** أول ما تسجل دخول
3. **استخدم HTTPS** في الإنتاج (Vercel/Railway/Render = تلقائي)
4. **Backup للـ DB** بشكل دوري
5. **Update dependencies**: `npm audit` و `npm outdated`
6. **Rate limiting الإنتاجي**: استبدل in-memory Map بـ Redis/Upstash
7. **Logging & Monitoring**: ضيف Sentry لرصد الأخطاء
8. **Email verification**: ضيف Resend/SendGrid لتأكيد الإيميلات

---

## 🛠️ Scripts

| Command | الوظيفة |
|---------|---------|
| `npm run dev` | تشغيل dev server |
| `npm run build` | بناء للإنتاج |
| `npm run start` | تشغيل الإنتاج |
| `npm run db:push` | sync schema للـ DB |
| `npm run db:migrate` | عمل migration |
| `npm run db:studio` | Prisma Studio (GUI للـ DB) |
| `npm run db:seed` | إنشاء admin + sample |

---

## 🌍 النشر

### Vercel (الأسهل)
1. ادفع الكود لـ GitHub
2. اربط الـ repo بـ Vercel
3. اضبط Env vars (نفس .env)
4. لـ DB: استخدم Neon أو Supabase أو Vercel Postgres
5. Deploy!

### Self-hosted
- Docker + nginx reverse proxy
- Let's Encrypt SSL
- PM2 لإدارة العمليات
- Backup منتظم للـ DB

---

## 📝 الترخيص

MIT — استخدمه براحتك.
