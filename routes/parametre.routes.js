import { Router } from 'express';
import * as ctrl from '../controllers/parametre.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

export const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.lister);
router.put('/etablissement', roleMiddleware('admin'), auditMiddleware, ctrl.modifierEtablissement);
router.put('/niveaux', roleMiddleware('admin'), auditMiddleware, ctrl.modifierNiveaux);
router.put('/semestres', roleMiddleware('admin'), auditMiddleware, ctrl.modifierSemestres);
router.put('/alertes', roleMiddleware('admin'), auditMiddleware, ctrl.modifierAlertes);
router.put('/equivalences/:id', roleMiddleware('admin'), auditMiddleware, ctrl.modifierEquivalence);
router.post('/taux-horaires', roleMiddleware('admin'), auditMiddleware, ctrl.creerTauxHoraire);
router.delete('/taux-horaires/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimerTauxHoraire);