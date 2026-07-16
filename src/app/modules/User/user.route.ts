import { Router } from 'express';
import { auth, validateRequest, authLimiter } from '../../middlewares';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import { MaintenanceAlertsController } from '../MaintenanceAlerts/maintenanceAlerts.controller';
import { MaintenanceAlertsValidation } from '../MaintenanceAlerts/maintenanceAlerts.validation';
import { multerUpload, multerPdfUpload } from '../../lib';
import { ROLE } from './user.constant';

const router = Router();

// 1. createUser
router
  .route('/signup')
  .post(
    authLimiter,
    validateRequest(UserValidation.createUserSchema),
    UserController.createUser,
  );

// 2. sendSignupOtpAgain
router
  .route('/send-signup-otp-again')
  .post(
    authLimiter,
    validateRequest(UserValidation.sendSignupOtpAgainSchema),
    UserController.sendSignupOtpAgain,
  );

// 3. verifySignupOtp
router
  .route('/verify-signup-otp')
  .post(
    authLimiter,
    validateRequest(UserValidation.verifySignupOtpSchema),
    UserController.verifySignupOtp,
  );

// 4. signin
router
  .route('/signin')
  .post(
    authLimiter,
    validateRequest(UserValidation.signinSchema),
    UserController.signin,
  );

// 5. social signin
router
  .route('/social-signin')
  .post(
    authLimiter,
    validateRequest(UserValidation.socialSigninSchema),
    UserController.socialSignin,
  );

// 6. updateProfilePhoto
router
  .route('/update-profile-photo')
  .put(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    multerUpload.single('user'),
    UserController.updateProfilePhoto,
  );

// 6. updateUserData
router
  .route('/update-user-data')
  .patch(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.updateUserDataSchema),
    UserController.updateUserData,
  );

// 7. changePassword
router
  .route('/change-password')
  .patch(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.changePasswordSchema),
    UserController.changePassword,
  );

// 8. forgotPassword
router
  .route('/forgot-password')
  .post(
    authLimiter,
    validateRequest(UserValidation.forgotPasswordSchema),
    UserController.forgotPassword,
  );

// 9. sendForgotPasswordOtpAgain
router
  .route('/send-forgot-password-otp-again')
  .post(
    authLimiter,
    validateRequest(UserValidation.sendForgotPasswordOtpAgainSchema),
    UserController.sendForgotPasswordOtpAgain,
  );

// 10. verifyOtpForForgotPassword
router
  .route('/verify-forgot-password-otp')
  .post(
    authLimiter,
    validateRequest(UserValidation.verifyOtpForForgotPasswordSchema),
    UserController.verifyOtpForForgotPassword,
  );

// 11. resetPassword
router
  .route('/reset-password')
  .post(
    authLimiter,
    validateRequest(UserValidation.resetPasswordSchema),
    UserController.resetPassword,
  );

// 12. fetchProfile
router
  .route('/profile')
  .get(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    UserController.fetchProfile,
  );

// 13. getNewAccessToken
router.route('/access-token').get(
  // validateRequest(UserValidation.getNewAccessTokenSchema),
  UserController.getNewAccessToken,
);

// 14. deactivateUserAccount
router
  .route('/deactive-account')
  .patch(
    auth(ROLE.USER),
    validateRequest(UserValidation.deactivateUserAccountSchema),
    UserController.deactivateUserAccount,
  );

// 15. deleteSpecificUserAccount
router
  .route('/delete-account')
  .delete(auth(ROLE.USER), UserController.deleteSpecificUserAccount);

// 16. adminGetAllUsers
router
  .route('/admin-get-all')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), UserController.adminGetAllUsers);

// 17. uploadImages
router
  .route('/upload-images')
  .post(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    multerUpload.array('images', 5),
    UserController.uploadImages,
  );

// uploadPdf
router
  .route('/upload-pdf')
  .post(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    multerPdfUpload.array('pdfs', 5),
    UserController.uploadPdf,
  );

// 18. deleteImage
router
  .route('/delete-image')
  .delete(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.deleteImageSchema),
    UserController.deleteImage,
  );

// 19. register / remove an FCM device token (any logged-in role)
router
  .route('/fcm-token')
  .post(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.fcmTokenSchema),
    UserController.addFcmToken,
  )
  .delete(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.fcmTokenSchema),
    UserController.removeFcmToken,
  );

// 20. maintenance alerts — read current states + toggle a subset (owner-scoped)
router
  .route('/maintenance-alerts')
  .get(auth(ROLE.USER), MaintenanceAlertsController.getMyMaintenanceAlerts)
  .patch(
    auth(ROLE.USER),
    validateRequest(MaintenanceAlertsValidation.toggleMaintenanceAlertsSchema),
    MaintenanceAlertsController.toggleMaintenanceAlerts,
  );

export const UserRoutes = router;
