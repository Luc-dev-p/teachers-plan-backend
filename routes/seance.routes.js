import { Router } from 'express';
import * as ctrl from '../controllers/seance.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

export const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.lister);
router.get('/emploi-du-temps', ctrl.emploiDuTemps);
router.post('/', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.creer);
router.patch('/:id/valider', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.valider);
router.patch('/:id/annuler', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.annuler);