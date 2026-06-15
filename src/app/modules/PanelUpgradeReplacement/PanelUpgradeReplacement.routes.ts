import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PanelUpgradeReplacementController } from './PanelUpgradeReplacement.controller';
import { PanelUpgradeReplacementValidation } from './PanelUpgradeReplacement.validation';
import { multerUpload } from '../../lib';

const router = Router();

const uploadPanelImages = multerUpload.fields([
  { name: 'meterPhotos', maxCount: 10 },
  { name: 'panelPhotos', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadPanelImages,
    validateRequestFromFormData(PanelUpgradeReplacementValidation.createSchema),
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
    uploadPanelImages,
    validateRequestFromFormData(PanelUpgradeReplacementValidation.updateSchema),
    PanelUpgradeReplacementController.updateSinglePanelUpgradeReplacement,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(PanelUpgradeReplacementValidation.idParamsSchema),
    PanelUpgradeReplacementController.deleteSinglePanelUpgradeReplacement,
  );

export const PanelUpgradeReplacementRoutes = router;
