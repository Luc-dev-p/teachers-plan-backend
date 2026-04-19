import { Router } from 'express';
import { lister, modifierMotDePasse, reinitialiserMotDePasse } from '../controllers/utilisateur.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

export const router = Router();

router.get('/', authMiddleware, roleMiddleware('admin'), lister);
router.put('/:id/mot-de-passe', authMiddleware, modifierMotDePasse);
router.post('/:id/reinitialiser-mot-de-passe', authMiddleware, roleMiddleware('admin'), reinitialiserMotDePasse);