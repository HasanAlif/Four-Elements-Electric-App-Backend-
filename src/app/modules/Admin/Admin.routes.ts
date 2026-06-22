import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AdminController } from './Admin.controller';
import { AdminValidation } from './Admin.validation';

const router = Router();

router
  .route('/quotes')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), AdminController.getAllQuotes);

// Must precede '/quotes/:id' so 'count'/'search' aren't matched as an :id.
router
  .route('/quotes/count')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), AdminController.getQoutesCount);

router
  .route('/quotes/search')
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    AdminController.searchByNameQidOrEmail,
  );

router
  .route('/quotes/:id')
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.idParamsSchema),
    AdminController.getSingleQuote,
  );

router
  .route('/quotes/:id/status')
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.idParamsSchema),
    AdminController.getQouteForUpdate,
  )
  .patch(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.updateQuoteStatusSchema),
    AdminController.updateQuoteStatus,
  );

router
  .route('/categories')
  .post(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.createCategorySchema),
    AdminController.createCategory,
  )
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), AdminController.getAllCategories);

router
  .route('/categories/:id')
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.categoryIdParamsSchema),
    AdminController.getSingleCategory,
  )
  .patch(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.updateCategorySchema),
    AdminController.updateCategory,
  )
  .delete(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.categoryIdParamsSchema),
    AdminController.deleteCategory,
  );

router
  .route('/partners')
  .post(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.createPartnerSchema),
    AdminController.createPartner,
  )
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), AdminController.getAllPartner);

router
  .route('/partners/search')
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    AdminController.searchPartnersByNameOrCategory,
  );

router
  .route('/partners/:id')
  .get(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.partnerIdParamsSchema),
    AdminController.getSinglePartner,
  )
  .patch(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.updatePartnerSchema),
    AdminController.updatePartner,
  )
  .delete(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.partnerIdParamsSchema),
    AdminController.deletePartner,
  );

router
  .route('/change-password')
  .patch(
    auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.changePasswordSchema),
    AdminController.changePassword,
  );

router
  .route('/profile')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), AdminController.getAdminProfile);

router
  .route('/create-admin')
  .post(
    auth(ROLE.SUPER_ADMIN),
    validateRequest(AdminValidation.createAdminUserSchema),
    AdminController.createAdminUserBySuperAdmin,
  );

router
  .route('/all-admins')
  .get(auth(ROLE.SUPER_ADMIN), AdminController.getAllAdmins);

router
  .route('/dashboard-stats')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), AdminController.getDashboardStats);

router
  .route('/:id/status')
  .patch(auth(ROLE.SUPER_ADMIN), AdminController.updateAdminUserStatus);

router
  .route('/:id')
  .get(auth(ROLE.SUPER_ADMIN), AdminController.getSingleAdmin)
  .delete(auth(ROLE.SUPER_ADMIN), AdminController.deleteAdminUserBySuperAdmin);

export const AdminRoutes = router;
