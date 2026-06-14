import { Router } from 'express';
import { ServiceCallController } from './ServiceCall.controller';
import {
  validateRequest,
  validateRequestFromFormData,
  auth,
} from '../../middlewares';
import { ServiceCallValidation } from './ServiceCall.validation';
import { ROLE } from '../User/user.constant';
import { multerUpload } from '../../lib';

const router = Router();

// image files accepted on create/update (uploaded to Cloudinary in the service)
const uploadServiceCallImages = multerUpload.fields([
  { name: 'panelPhotos', maxCount: 10 },
  { name: 'workAreaPhotos', maxCount: 10 },
  { name: 'extraReferencePhotos', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadServiceCallImages,
    validateRequestFromFormData(ServiceCallValidation.createServiceCallSchema),
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
    uploadServiceCallImages,
    validateRequestFromFormData(ServiceCallValidation.updateServiceCallSchema),
    ServiceCallController.updateServiceCall,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(ServiceCallValidation.serviceCallIdParamsSchema),
    ServiceCallController.deleteServiceCall,
  );

export const ServiceCallRoutes = router;
