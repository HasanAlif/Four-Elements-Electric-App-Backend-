import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DockPowerController } from './DockPower.controller';
import { DockPowerValidation } from './DockPower.validation';
import { multerUpload } from '../../lib';

const router = Router();

const uploadDockPowerImages = multerUpload.fields([
  { name: 'panelPhotos', maxCount: 10 },
  { name: 'existingSpacePhotos', maxCount: 10 },
  { name: 'plansDrawingsPhotos', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadDockPowerImages,
    validateRequestFromFormData(DockPowerValidation.createSchema),
    DockPowerController.createDockPower,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    DockPowerController.getAllDockPowers,
  );

router
  .route('/my')
  .get(auth(ROLE.USER), DockPowerController.getMyAllDockPowers);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(DockPowerValidation.idParamsSchema),
    DockPowerController.getSingleDockPower,
  )
  .patch(
    auth(ROLE.USER),
    uploadDockPowerImages,
    validateRequestFromFormData(DockPowerValidation.updateSchema),
    DockPowerController.updateSingleDockPower,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(DockPowerValidation.idParamsSchema),
    DockPowerController.deleteSingleDockPower,
  );

export const DockPowerRoutes = router;
