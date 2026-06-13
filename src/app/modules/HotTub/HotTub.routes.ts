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
    HotTubController.createHotTub,
  )
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), HotTubController.getAllHotTubs);

router.route('/my').get(auth(ROLE.USER), HotTubController.getMyAllHotTubs);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(HotTubValidation.idParamsSchema),
    HotTubController.getSingleHotTub,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(HotTubValidation.updateSchema),
    HotTubController.updateSingleHotTub,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(HotTubValidation.idParamsSchema),
    HotTubController.deleteSingleHotTub,
  );

export const HotTubRoutes = router;
