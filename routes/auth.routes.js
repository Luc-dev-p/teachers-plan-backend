import { Router } from 'express';
import { connexion, profil } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const router = Router();

router.post('/connexion', connexion);
router.get('/profil', authMiddleware, profil);