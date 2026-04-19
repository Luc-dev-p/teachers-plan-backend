import { Router } from 'express';
import * as ctrl from '../controllers/export.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

export const router = Router();
router.use(authMiddleware);

router.get('/heures/excel', roleMiddleware('admin', 'rh'), ctrl.exportHeuresExcel);
router.get('/heures/pdf', roleMiddleware('admin', 'rh'), ctrl.exportHeuresPDF);
router.get('/seances/excel', roleMiddleware('admin', 'rh'), ctrl.exportSeancesExcel);