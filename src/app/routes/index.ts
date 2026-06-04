import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { ServiceCallRoutes } from '../modules/ServiceCall/ServiceCall.routes';
import { AddressRoutes } from '../modules/Address/address.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/addresses',
    route: AddressRoutes,
  },
  {
    path: '/service-calls',
    route: ServiceCallRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
