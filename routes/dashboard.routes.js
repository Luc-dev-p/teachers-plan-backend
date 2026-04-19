import { Router } from 'express';
import { statistiques } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const router = Router();
router.get('/', authMiddleware, statistiques);