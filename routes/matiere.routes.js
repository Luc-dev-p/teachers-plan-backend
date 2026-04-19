import { Router } from 'express';
import * as ctrl from '../controllers/matiere.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

export const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.lister);
router.post('/', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.creer);
router.put('/:id', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.modifier);
router.delete('/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimer);