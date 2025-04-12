import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, requestId } from './middlewares/error-handler';
import v1Router from './routes/v1';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Request ID middleware
app.use(requestId);

// Routes
app.use('/api/v1', v1Router);

// Error handling
app.use(errorHandler);

export default app; 