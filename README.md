# 🚀 COTOVE API (Backend)

⚠️ **Note:** This API is still in development and **not yet finalized**. Contributions and feedback are welcome!

---

## 📌 Tech Stack

COTOVE API is built using modern, secure, and scalable technologies to ensure robustness and maintainability:

- **[Express.js](https://expressjs.com/)** - A fast and minimalist Node.js framework for building APIs.
- **[PostgreSQL](https://www.postgresql.org/)** - A powerful, open-source relational database system.
- **[Zod](https://zod.dev/)** - Type-safe schema validation for request bodies and parameters.
- **[JSON Web Token (JWT)](https://jwt.io/)** - Secure authentication and authorization using tokens.
- **[Prisma](https://www.prisma.io/)** - A next-generation ORM for TypeScript and Node.js with type-safe database access.
- **[CORS](https://www.npmjs.com/package/cors)** - Middleware to handle Cross-Origin Resource Sharing.
- **[Helmet](https://helmetjs.github.io/)** - Security middleware to protect HTTP headers.
- **[HPP](https://www.npmjs.com/package/hpp)** - Protection against HTTP Parameter Pollution attacks.
- **[TypeScript](https://www.typescriptlang.org/)** - Adds static typing for better code quality and maintainability.

---

## 🛠️ Installation & Setup

Follow these steps to set up the COTOVE API on your local machine.

### 1️⃣ **Clone the Repository & Install Dependencies**

```sh
git clone https://github.com/your-repo/cotove-api.git
cd cotove-api
npm install
```

### 2️⃣ **Set Up PostgreSQL Database**

```sh
1. Download and install PostgreSQL from the **[official website](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)** .
2. Create a new database for the project.
```

### 3️⃣ **Configure Environment Variables**

```sh
PORT=8080
BACKEND=http://localhost:3000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
ALLOWED_ORIGINS=http://localhost:3000,http://example.com
```

### 4️⃣ **Prisma - Generate and Migrate Database**

```sh
npm run prisma:generate
npm run prisma:migrate
```

### 5️⃣ **Start the Server**

```sh
npm run dev - For Development
npm run build && npm start - For Production
```
