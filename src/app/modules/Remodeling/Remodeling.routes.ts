import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { RemodelingController } from './Remodeling.controller';
import { RemodelingValidation } from './Remodeling.validation';
import { ServiceCallController } from '../ServiceCall/ServiceCall.controller';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.createSchema),
    RemodelingController.createRemodeling,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    RemodelingController.getAllRemodelings,
  );

router
  .route('/my')
  .get(auth(ROLE.USER), RemodelingController.getMyAllRemodelings);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.idParamsSchema),
    RemodelingController.getSingleRemodeling,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.updateSchema),
    RemodelingController.updateSingleRemodeling,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.idParamsSchema),
    RemodelingController.deleteSingleRemodeling,
  );;

export const RemodelingRoutes = router;
