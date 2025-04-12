# Cotove API (In Progress)

A RESTful API for the Cotove application built with Express, TypeScript, and PostgreSQL.

## Features

- TypeScript for type safety
- Express.js for the web framework
- PostgreSQL with DrizzleORM for database
- ZOD for request validation
- Winston for logging
- Jest for testing
- ESLint and Prettier for code quality
- Husky for git hooks

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cotove-api.git
cd cotove-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/cotove
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the TypeScript project
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── validations/    # Request validation schemas
├── types/          # TypeScript type definitions
├── app.ts          # Express application
└── index.ts        # Application entry point
```

## License

ISC 