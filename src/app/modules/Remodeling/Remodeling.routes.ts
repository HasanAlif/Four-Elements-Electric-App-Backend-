import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { RemodelingController } from './Remodeling.controller';
import { RemodelingValidation } from './Remodeling.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.createSchema),
    RemodelingController.create,
  )
  .get(auth(ROLE.USER), RemodelingController.getMyAll);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.idParamsSchema),
    RemodelingController.getSingle,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.updateSchema),
    RemodelingController.updateSingle,
  );

export const RemodelingRoutes = router;
