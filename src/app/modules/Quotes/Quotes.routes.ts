import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { QuotesController } from './Quotes.controller';

const router = Router();

router.route('/').get(auth(ROLE.USER), QuotesController.getAllMyQuotes);

router
  .route('/recent-activity')
  .get(auth(ROLE.USER), QuotesController.getUserRecntActivity);

router
  .route('/search')
  .get(auth(ROLE.USER), QuotesController.searchQuoteAndPartners);

router
  .route('/categories')
  .get(auth(ROLE.USER), QuotesController.getAllCategoriesDetails);

router
  .route('/categories/:id/partners')
  .get(auth(ROLE.USER), QuotesController.getAllPartnerDetailsInSingleCategory);

router
  .route('/favorites')
  .get(auth(ROLE.USER), QuotesController.getAllMyFavoritePartners);

router
  .route('/favorites/:partnerId')
  .post(auth(ROLE.USER), QuotesController.togglePartnerFavorite)
  .get(auth(ROLE.USER), QuotesController.getMySingleFavoritePartnerDetails);

router
  .route('/:id')
  .get(auth(ROLE.USER), QuotesController.getMySingleQuoteActivityDetails);

export const QuotesRoutes = router;
