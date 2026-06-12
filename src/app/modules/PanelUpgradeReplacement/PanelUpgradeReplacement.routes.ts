import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PanelUpgradeReplacementController } from './PanelUpgradeReplacement.controller';
import { PanelUpgradeReplacementValidation } from './PanelUpgradeReplacement.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(PanelUpgradeReplacementValidation.createSchema),
    PanelUpgradeReplacementController.createPanelUpgradeReplacement,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    PanelUpgradeReplacementController.getAllPanelUpgradeReplacements,
  );

router
  .route('/my')
  .get(
    auth(ROLE.USER),
    PanelUpgradeReplacementController.getMyAllPanelUpgradeReplacements,
  );

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(PanelUpgradeReplacementValidation.idParamsSchema),
    PanelUpgradeReplacementController.getSinglePanelUpgradeReplacement,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(PanelUpgradeReplacementValidation.updateSchema),
    PanelUpgradeReplacementController.updateSinglePanelUpgradeReplacement,
  );

export const PanelUpgradeReplacementRoutes = router;
