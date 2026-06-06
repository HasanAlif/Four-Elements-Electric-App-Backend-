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
    AccessoryBuildingPowerController.create,
  )
  .get(auth(ROLE.USER), AccessoryBuildingPowerController.getMyAll);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(AccessoryBuildingPowerValidation.idParamsSchema),
    AccessoryBuildingPowerController.getSingle,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(AccessoryBuildingPowerValidation.updateSchema),
    AccessoryBuildingPowerController.updateSingle,
  );

export const AccessoryBuildingPowerRoutes = router;
