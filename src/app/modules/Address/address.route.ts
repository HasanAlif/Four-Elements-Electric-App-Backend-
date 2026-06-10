import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AddressController } from './address.controller';
import { AddressValidation } from './address.validation';

const router = Router();

// getMyAllAddresses
router
  .route('/my-all')
  .get(auth(ROLE.USER), AddressController.getMyAllAddresses);

// getSingleAddress
router
  .route('/:id')
  .get(
    auth(ROLE.USER),
    validateRequest(AddressValidation.addressIdParamsSchema),
    AddressController.getSingleAddress,
  )
  // updateSingleAddress
  .patch(
    auth(ROLE.USER),
    validateRequest(AddressValidation.updateAddressSchema),
    AddressController.updateSingleAddress,
  )
  // deleteSingleAddress
  .delete(
    auth(ROLE.USER),
    validateRequest(AddressValidation.addressIdParamsSchema),
    AddressController.deleteSingleAddress,
  );

export const AddressRoutes = router;
