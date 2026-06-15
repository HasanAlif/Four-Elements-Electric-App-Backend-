import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { HotTubController } from './HotTub.controller';
import { HotTubValidation } from './HotTub.validation';
import { multerUpload } from '../../lib';

const router = Router();

const uploadHotTubImages = multerUpload.fields([
  { name: 'manualDocument', maxCount: 1 },
  { name: 'panelPhotos', maxCount: 10 },
  { name: 'hotTubPhotos', maxCount: 10 },
  { name: 'receptaclePhotos', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadHotTubImages,
    validateRequestFromFormData(HotTubValidation.createSchema),
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
    uploadHotTubImages,
    validateRequestFromFormData(HotTubValidation.updateSchema),
    HotTubController.updateSingleHotTub,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(HotTubValidation.idParamsSchema),
    HotTubController.deleteSingleHotTub,
  );

export const HotTubRoutes = router;
