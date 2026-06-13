import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DockPowerController } from './DockPower.controller';
import { DockPowerValidation } from './DockPower.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(DockPowerValidation.createSchema),
    DockPowerController.createDockPower,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    DockPowerController.getAllDockPowers,
  );

router.get('/my', auth(ROLE.USER), DockPowerController.getMyAllDockPowers);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(DockPowerValidation.idParamsSchema),
    DockPowerController.getSingleDockPower,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(DockPowerValidation.updateSchema),
    DockPowerController.updateSingleDockPower,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(DockPowerValidation.idParamsSchema),
    DockPowerController.deleteSingleDockPower,
  );

export const DockPowerRoutes = router;
