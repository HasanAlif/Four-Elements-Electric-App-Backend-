import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AccessoryBuildingPowerController } from './AccessoryBuildingPower.controller';
import { AccessoryBuildingPowerValidation } from './AccessoryBuildingPower.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(AccessoryBuildingPowerValidation.createSchema),
    AccessoryBuildingPowerController.createAccessoryBuilding,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    AccessoryBuildingPowerController.getAllAccessoryBuildings,
  );

router.get(
  '/my',
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
    validateRequest(AccessoryBuildingPowerValidation.updateSchema),
    AccessoryBuildingPowerController.updateSingleAccessoryBuilding,
  );

export const AccessoryBuildingPowerRoutes = router;
