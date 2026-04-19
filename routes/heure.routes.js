import { Router } from 'express';
import * as ctrl from '../controllers/heure.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.lister);
router.get('/resume', ctrl.resumeParEnseignant);