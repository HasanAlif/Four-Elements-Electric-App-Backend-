import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AccessoryBuildingPowerController } from './AccessoryBuildingPower.controller';
import { AccessoryBuildingPowerValidation } from './AccessoryBuildingPower.validation';
import { multerUpload } from '../../lib';

const router = Router();

const uploadAccessoryBuildingImages = multerUpload.fields([
  { name: 'panelPhotos', maxCount: 10 },
  { name: 'existingSpacePhotos', maxCount: 10 },
  { name: 'plansDrawings', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadAccessoryBuildingImages,
    validateRequestFromFormData(AccessoryBuildingPowerValidation.createSchema),
    AccessoryBuildingPowerController.createAccessoryBuilding,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    AccessoryBuildingPowerController.getAllAccessoryBuildings,
  );

router
  .route('/my')
  .get(
    auth(ROLE.USER),
    AccessoryBuildingPowerController.getMyAllAccessoryBuildings,
  );

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(AccessoryBuildingPowerValidation.idParamsSchema),
    AccessoryBuildingPowerController.getSingleAccessoryBuilding,
  )
  .patch(
    auth(ROLE.USER),
    uploadAccessoryBuildingImages,
    validateRequestFromFormData(AccessoryBuildingPowerValidation.updateSchema),
    AccessoryBuildingPowerController.updateSingleAccessoryBuilding,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(AccessoryBuildingPowerValidation.idParamsSchema),
    AccessoryBuildingPowerController.deleteSingleAccessoryBuilding,
  );

export const AccessoryBuildingPowerRoutes = router;
