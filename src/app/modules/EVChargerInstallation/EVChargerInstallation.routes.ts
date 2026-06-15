import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { EVChargerInstallationController } from './EVChargerInstallation.controller';
import { EVChargerInstallationValidation } from './EVChargerInstallation.validation';
import { multerUpload } from '../../lib';

const router = Router();

const uploadEVChargerImages = multerUpload.fields([
  { name: 'areaPhoto', maxCount: 1 },
  { name: 'panelPhotos', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadEVChargerImages,
    validateRequestFromFormData(EVChargerInstallationValidation.createSchema),
    EVChargerInstallationController.createEVChargerInstallation,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    EVChargerInstallationController.getAllEVChargerInstallations,
  );

router
  .route('/my')
  .get(
    auth(ROLE.USER),
    EVChargerInstallationController.getMyAllEVChargerInstallations,
  );

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(EVChargerInstallationValidation.idParamsSchema),
    EVChargerInstallationController.getSingleEVChargerInstallation,
  )
  .patch(
    auth(ROLE.USER),
    uploadEVChargerImages,
    validateRequestFromFormData(EVChargerInstallationValidation.updateSchema),
    EVChargerInstallationController.updateSingleEVChargerInstallation,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(EVChargerInstallationValidation.idParamsSchema),
    EVChargerInstallationController.deleteSingleEVChargerInstallation,
  );

export const EVChargerInstallationRoutes = router;
