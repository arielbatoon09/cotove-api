# 🚀 COTOVE API (Backend)

⚠️ **Note:** This API is still in development and **not yet finalized**.

## 📌 Tech Stack
COTOVE API is built using modern, secure, and scalable technologies:
- **[Express.js](https://expressjs.com/)** - Fast and minimalist Node.js framework for APIs
- **[PostgreSQL](https://www.postgresql.org/)** - Reliable and scalable relational database
- **[Zod](https://zod.dev/)** - Type-safe validation for request bodies and parameters
- **[JSON Web Token (JWT)](https://jwt.io/)** - Secure authentication and authorization
- **[Prisma](https://www.prisma.io/)** - Type-safe ORM for PostgreSQL
- **[CORS](https://www.npmjs.com/package/cors)** - Handling cross-origin resource sharing
- **[Helmet](https://helmetjs.github.io/)** - Security middleware for HTTP headers
- **[HPP](https://www.npmjs.com/package/hpp)** - Protection against HTTP parameter pollution
- **[TypeScript](https://www.typescriptlang.org/)** - Static typing for better maintainability

---

## 🛠️ Installation & Setup

### 1️⃣ **Clone the Repository & Install Dependencies**
```sh
git clone https://github.com/your-repo/cotove-api.git
cd cotove-api
npm install


### 2️⃣ **Create PostgreSQL Database**
- **[Download here](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)**

### 3️⃣ **Set Up Environment Variables**
PORT=
BACKEND=
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ALLOWED_ORIGINS=

### 4️⃣ **Prisma - Generate and Migrate DB**
npm run prisma:generate
npm run prisma:migrate

### 5️⃣ **Start Development / Production Server**
npm run dev - For Development
npm run build && npm start - For Production