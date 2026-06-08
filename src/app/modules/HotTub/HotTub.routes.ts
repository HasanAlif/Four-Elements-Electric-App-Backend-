import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { HotTubController } from './HotTub.controller';
import { HotTubValidation } from './HotTub.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(HotTubValidation.createSchema),
    HotTubController.create,
  )
  .get(auth(ROLE.USER), HotTubController.getMyAll);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(HotTubValidation.idParamsSchema),
    HotTubController.getSingle,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(HotTubValidation.updateSchema),
    HotTubController.updateSingle,
  );

export const HotTubRoutes = router;
