import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AddressController } from './address.controller';
import { AddressValidation } from './address.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(ROLE.USER),
    validateRequest(AddressValidation.createAddressSchema),
    AddressController.createAddress,
  );

router
  .route('/my-all')
  .get(auth(ROLE.USER), AddressController.getMyAllAddresses);

router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(AddressValidation.addressIdParamsSchema),
    AddressController.getSingleAddress,
  )
  .patch(
    auth(ROLE.USER),
    validateRequest(AddressValidation.updateAddressSchema),
    AddressController.updateSingleAddress,
  );

export const AddressRoutes = router;
