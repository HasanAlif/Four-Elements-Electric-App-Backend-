import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { NotificationController } from './Notification.controller';
import { NotificationValidation } from './Notification.validation';

const router = Router();

router
  .route('/')
  .get(
    auth(ROLE.USER),
    validateRequest(NotificationValidation.getMyNotificationsSchema),
    NotificationController.getMyNotifications,
  );

router
  .route('/mark-all-read')
  .patch(auth(ROLE.USER), NotificationController.markAllAsRead);

router
  .route('/:id/read')
  .patch(
    auth(ROLE.USER),
    validateRequest(NotificationValidation.idParamsSchema),
    NotificationController.markOneAsRead,
  );

export const NotificationRoutes = router;
