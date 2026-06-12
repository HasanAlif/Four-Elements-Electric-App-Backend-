import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { EVChargerInstallationController } from './EVChargerInstallation.controller';
import { EVChargerInstallationValidation } from './EVChargerInstallation.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(EVChargerInstallationValidation.createSchema),
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
    validateRequest(EVChargerInstallationValidation.updateSchema),
    EVChargerInstallationController.updateSingleEVChargerInstallation,
  );

export const EVChargerInstallationRoutes = router;
