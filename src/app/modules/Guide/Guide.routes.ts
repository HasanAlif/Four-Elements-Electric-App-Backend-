import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { GuideController } from './Guide.controller';
import { GuideValidation } from './Guide.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(GuideValidation.createGuideSchema),
    GuideController.createGuide,
  )
  .get(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(GuideValidation.listQuerySchema),
    GuideController.getAllGuides,
  );

// Literal path must precede '/:id' so 'saved' isn't captured as an id.
router
  .route('/saved')
  .get(
    auth(ROLE.USER),
    validateRequest(GuideValidation.listQuerySchema),
    GuideController.getMySavedGuides,
  );

router
  .route('/:id')
  .get(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(GuideValidation.idParamsSchema),
    GuideController.getSingleGuide,
  );

router
  .route('/:id/save')
  .post(
    auth(ROLE.USER),
    validateRequest(GuideValidation.idParamsSchema),
    GuideController.saveGuide,
  )
  .delete(
    auth(ROLE.USER),
    validateRequest(GuideValidation.idParamsSchema),
    GuideController.unsaveGuide,
  );

export const GuideRoutes = router;
