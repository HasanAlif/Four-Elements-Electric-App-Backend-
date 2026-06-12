import { Router } from 'express';
import { ServiceCallController } from './ServiceCall.controller';
import { validateRequest, auth } from '../../middlewares';
import { ServiceCallValidation } from './ServiceCall.validation';
import { ROLE } from '../User/user.constant';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(ServiceCallValidation.createServiceCallSchema),
    ServiceCallController.createServiceCall,
  )
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    ServiceCallController.getAllServiceCalls,
  );

router
  .route('/my')
  .get(auth(ROLE.USER), ServiceCallController.getMyAllServiceCalls);

router
  .route('/:id')
  .get(
    validateRequest(ServiceCallValidation.serviceCallIdParamsSchema),
    ServiceCallController.getSingleServiceCall,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(ServiceCallValidation.updateServiceCallSchema),
    ServiceCallController.updateServiceCall,
  );

export const ServiceCallRoutes = router;
