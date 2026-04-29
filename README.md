# EduShare - Live Classroom Collaboration Platform

EduShare is a beautiful, fully functional live classroom collaboration platform built for seamless interaction between teachers and students.

## Features
- **Role-Based Workflows**: Tailored dashboards for Teachers (upload, annotate, manage) and Students (view, learn, access notes).
- **Live Smart Board**: Real-time PDF/Image viewing with synchronous page navigation and live drawing/annotations.
- **AI Integration (Gemini)**: Automatic generation of structured student notes from materials, plus an AI Spell Check tool for teachers.
- **Robust Real-Time**: Socket.io + Upstash Redis for broadcasting annotations and notifications instantly.
- **Beautiful UI/UX**: Custom SVG floating backgrounds, modern typography (Plus Jakarta Sans, Inter, JetBrains Mono), and fluid animations.

---

## Tech Stack
- **Framework**: Next.js 14 App Router
- **Database**: Prisma ORM with PostgreSQL (Supabase / Railway)
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **Real-Time**: Socket.io & Upstash Redis
- **AI**: Google Gemini 1.5 Flash
- **Storage**: Cloudinary
- **Styling**: Tailwind CSS & Vanilla CSS (for custom keyframes/Design System)

---

## Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root directory using the template below:

```env
# ─── APP ───────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-random-secret

# ─── DATABASE (PostgreSQL) ─────────────────────────
DATABASE_URL=your-prisma-connection-pool-url
DIRECT_URL=your-direct-postgres-url

# ─── REDIS (Upstash) ───────────────────────────────
UPSTASH_REDIS_REST_URL=your-upstash-rest-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-rest-token
REDIS_URL=your-upstash-redis-url

# ─── AUTH — Google OAuth ───────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ─── FILE STORAGE (Cloudinary) ─────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# ─── AI — GEMINI ───────────────────────────────────
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# ─── SOCKET SERVER ─────────────────────────────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_SECRET=your-socket-secret
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Push the schema to your database and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the Development Servers
You will need two terminal windows running concurrently.

**Terminal 1 (Next.js Frontend & API):**
```bash
npm run dev
```

**Terminal 2 (Socket.io Real-Time Server):**
First, add this script to your `package.json` if not already there:
`"start:socket": "ts-node server/socket-server.ts"`

Then run:
```bash
npm run start:socket
```

### 5. Access the Platform
Navigate to `http://localhost:3000` in your browser. Log in with Google, select a role (Teacher/Student), and start collaborating!
