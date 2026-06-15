import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { ElectricController } from './Electric.controller';
import { ElectricValidation } from './Electric.validation';
import { multerUpload } from '../../lib';

const router = Router();

const uploadElectricImages = multerUpload.fields([
  { name: 'panelPhotos', maxCount: 10 },
]);

router
  .route('/')
  .post(
    auth(ROLE.USER),
    uploadElectricImages,
    validateRequestFromFormData(ElectricValidation.createSchema),
    ElectricController.createElectric,
  )
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), ElectricController.getAllElectrics);

router.route('/my').get(auth(ROLE.USER), ElectricController.getMyAllElectrics);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(ElectricValidation.idParamsSchema),
    ElectricController.getSingleElectric,
  )
  .patch(
    auth(ROLE.USER),
    uploadElectricImages,
    validateRequestFromFormData(ElectricValidation.updateSchema),
    ElectricController.updateSingleElectric,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(ElectricValidation.idParamsSchema),
    ElectricController.deleteSingleElectric,
  );

export const ElectricRoutes = router;
