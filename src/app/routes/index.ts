import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { ServiceCallRoutes } from '../modules/ServiceCall/ServiceCall.routes';
import { EVChargerInstallationRoutes } from '../modules/EVChargerInstallation/EVChargerInstallation.routes';
import { PanelUpgradeReplacementRoutes } from '../modules/PanelUpgradeReplacement/PanelUpgradeReplacement.routes';
import { RemodelingRoutes } from '../modules/Remodeling/Remodeling.routes';
import { AccessoryBuildingPowerRoutes } from '../modules/AccessoryBuildingPower/AccessoryBuildingPower.routes';
import { HotTubRoutes } from '../modules/HotTub/HotTub.routes';
import { DockPowerRoutes } from '../modules/DockPower/DockPower.routes';
import { ElectricRoutes } from '../modules/Electric/Electric.routes';
import { GenaratorRoutes } from '../modules/Genarator/Genarator.routes';
import { NewConstructionRoutes } from '../modules/NewConstruction/NewConstruction.routes';
import { HomeSurgeProtectionRoutes } from '../modules/HomeSurgeProtection/HomeSurgeProtection.routes';
import { StarlinkRoutes } from '../modules/Starlink/Starlink.routes';
import { DedicatedCircuitRoutes } from '../modules/DedicatedCircuit/DedicatedCircuit.routes';
import { ExhaustFansRoutes } from '../modules/ExhaustFans/ExhaustFans.routes';
import { OutletsRoutes } from '../modules/Outlets/Outlets.routes';
import { SwitchesRoutes } from '../modules/Switches/Switches.routes';
import { LightingRoutes } from '../modules/Lighting/Lighting.routes';
import { CellingFansRoutes } from '../modules/CellingFans/CellingFans.routes';
import { DraftRoutes } from '../modules/Draft/Draft.routes';
import { AdminRoutes } from '../modules/Admin/Admin.routes';
import { FAQRoutes } from '../modules/FAQ/FAQ.routes';
import { appContentRoutes } from '../modules/FAQ/appContent.route';
import { QuotesRoutes } from '../modules/Quotes/Quotes.routes';
import { NotificationRoutes } from '../modules/Notification/Notification.routes';
import { MaintenanceCronRoutes } from '../modules/MaintenanceAlerts/maintenanceAlerts.routes';
import { GuideRoutes } from '../modules/Guide/Guide.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
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
  {
    path: '/dock-powers',
    route: DockPowerRoutes,
  },
  {
    path: '/electrics',
    route: ElectricRoutes,
  },
  {
    path: '/generators',
    route: GenaratorRoutes,
  },
  {
    path: '/new-constructions',
    route: NewConstructionRoutes,
  },
  {
    path: '/home-surge-protections',
    route: HomeSurgeProtectionRoutes,
  },
  {
    path: '/starlinks',
    route: StarlinkRoutes,
  },
  {
    path: '/dedicated-circuits',
    route: DedicatedCircuitRoutes,
  },
  {
    path: '/exhaust-fans',
    route: ExhaustFansRoutes,
  },
  {
    path: '/outlets',
    route: OutletsRoutes,
  },
  {
    path: '/switches',
    route: SwitchesRoutes,
  },
  {
    path: '/lighting',
    route: LightingRoutes,
  },
  {
    path: '/ceiling-fans',
    route: CellingFansRoutes,
  },
  {
    path: '/drafts',
    route: DraftRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/faqs',
    route: FAQRoutes,
  },
  {
    path: '/app-content',
    route: appContentRoutes,
  },
  {
    path: '/quotes',
    route: QuotesRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/internal/cron',
    route: MaintenanceCronRoutes,
  },
  {
    path: '/guides',
    route: GuideRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
