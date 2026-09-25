# Korevante Studio — Premium SaaS Platform

![Korevante Studio](https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=2000&auto=format&fit=crop)

Korevante Studio is a comprehensive, production-ready SaaS platform offering 50+ tools covering AI Content Generation, Image Processing, PDF Manipulation, Video Utilities, and Developer Productivity.

## 🚀 Features

* **50+ Production Tools**: AI Writers, Background Removers, PDF Mergers, JSON Formatters, and more.
* **Authentication**: NextAuth.js v4 (Credentials + Google OAuth) with bcrypt hashing.
* **Database & ORM**: Prisma ORM with PostgreSQL.
* **Payments**: Full Razorpay subscription integration (Orders, Webhooks, Signature Verification).
* **Usage Gating**: Server-side enforced plan limits and trial expiration tracking.
* **File Processing**: `sharp` for Images, `pdf-lib` for PDFs.
* **AI Integration**: Google Generative AI (Gemini) integration.
* **Admin Center**: Dedicated `/admin` dashboard for global platform metrics.

## 💻 Tech Stack

* **Framework**: Next.js 15 (App Router)
* **Language**: TypeScript (Strict)
* **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
* **Database**: PostgreSQL (via Prisma)
* **Payments**: Razorpay
* **AI**: Google Generative AI

## 🛠️ Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/toolverse"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   RAZORPAY_WEBHOOK_SECRET="..."
   GEMINI_API_KEY="..."
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔐 Admin Access

The database seed script automatically creates an admin account:
* **Email**: `admin@k5orevante.com`
* **Password**: `Admin@81234`
* **Plan**: PREMIUM

Login with these credentials and navigate to the **Admin Center** via the sidebar.

## 📦 Production Deployment

1. Set up a PostgreSQL database (e.g., Supabase, Neon, or RDS).
2. Set up Razorpay account and get API keys.
3. Deploy to Vercel or your preferred Node.js hosting.
   * Add all Environment Variables in the Vercel dashboard.
   * Set the Build Command to `npm run build`.
   * Vercel will automatically run `prisma generate`. You may need to run `npx prisma db push` manually or add it to a CI pipeline.

---
*Built with ❤️ for Creators, Freelancers, and Developers.*
