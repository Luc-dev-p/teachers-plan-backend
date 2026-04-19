import { Router } from 'express';
import * as ctrl from '../controllers/enseignant.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

export const router = Router();
router.use(authMiddleware);

// Enseignants
router.get('/', ctrl.listerEnseignants);
router.post('/', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.creerEnseignant);
router.put('/:id', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.modifierEnseignant);
router.delete('/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimerEnseignant);

// Départements
router.get('/departements', ctrl.listerDepartements);
router.post('/departements', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.creerDepartement);
router.put('/departements/:id', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.modifierDepartement);
router.delete('/departements/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimerDepartement);

// Filières
router.get('/filieres', ctrl.listerFilieres);
router.post('/filieres', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.creerFiliere);
router.put('/filieres/:id', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.modifierFiliere);
router.delete('/filieres/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimerFiliere);

// Niveaux
router.get('/niveaux', ctrl.listerNiveaux);
router.post('/niveaux', roleMiddleware('admin'), auditMiddleware, ctrl.creerNiveau);
router.put('/niveaux/:id', roleMiddleware('admin'), auditMiddleware, ctrl.modifierNiveau);
router.delete('/niveaux/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimerNiveau);

// Classes
router.get('/classes', ctrl.listerClasses);
router.post('/classes', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.creerClasse);
router.put('/classes/:id', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.modifierClasse);
router.delete('/classes/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimerClasse);

// Salles
router.get('/salles', ctrl.listerSalles);
router.post('/salles', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.creerSalle);
router.put('/salles/:id', roleMiddleware('admin', 'rh'), auditMiddleware, ctrl.modifierSalle);
router.delete('/salles/:id', roleMiddleware('admin'), auditMiddleware, ctrl.supprimerSalle);