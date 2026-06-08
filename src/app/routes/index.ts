import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { AddressRoutes } from '../modules/Address/address.route';
import { ServiceCallRoutes } from '../modules/ServiceCall/ServiceCall.routes';
import { EVChargerInstallationRoutes } from '../modules/EVChargerInstallation/EVChargerInstallation.routes';
import { PanelUpgradeReplacementRoutes } from '../modules/PanelUpgradeReplacement/PanelUpgradeReplacement.routes';
import { RemodelingRoutes } from '../modules/Remodeling/Remodeling.routes';
import { AccessoryBuildingPowerRoutes } from '../modules/AccessoryBuildingPower/AccessoryBuildingPower.routes';
import { HotTubRoutes } from '../modules/HotTub/HotTub.routes';

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
  {
    path: '/ev-charger-installations',
    route: EVChargerInstallationRoutes,
  },
  {
    path: '/panel-upgrade-replacements',
    route: PanelUpgradeReplacementRoutes,
  },
  {
    path: '/remodelings',
    route: RemodelingRoutes,
  },
  {
    path: '/accessory-building-powers',
    route: AccessoryBuildingPowerRoutes,
  },
  {
    path: '/hot-tub-installations',
    route: HotTubRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
