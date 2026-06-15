import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { RemodelingController } from './Remodeling.controller';
import { RemodelingValidation } from './Remodeling.validation';
import { multerUpload } from '../../lib';

const router = Router();

const uploadRemodelingImages = multerUpload.fields([
  { name: 'plansDrawings', maxCount: 10 },
  { name: 'existingSpacePhotos', maxCount: 10 },
  { name: 'panelPhotos', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadRemodelingImages,
    validateRequestFromFormData(RemodelingValidation.createSchema),
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
    uploadRemodelingImages,
    validateRequestFromFormData(RemodelingValidation.updateSchema),
    RemodelingController.updateSingleRemodeling,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(RemodelingValidation.idParamsSchema),
    RemodelingController.deleteSingleRemodeling,
  );

export const RemodelingRoutes = router;
