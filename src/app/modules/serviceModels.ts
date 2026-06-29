/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';

import AccessoryBuildingPowerModel from './AccessoryBuildingPower/AccessoryBuildingPower.model';
import CellingFansModel from './CellingFans/CellingFans.model';
import DedicatedCircuitModel from './DedicatedCircuit/DedicatedCircuit.model';
import DockPowerModel from './DockPower/DockPower.model';
import ElectricModel from './Electric/Electric.model';
import EVChargerInstallationModel from './EVChargerInstallation/EVChargerInstallation.model';
import ExhaustFansModel from './ExhaustFans/ExhaustFans.model';
import GenaratorModel from './Genarator/Genarator.model';
import HomeSurgeProtectionModel from './HomeSurgeProtection/HomeSurgeProtection.model';
import HotTubModel from './HotTub/HotTub.model';
import LightingModel from './Lighting/Lighting.model';
import NewConstructionModel from './NewConstruction/NewConstruction.model';
import OutletsModel from './Outlets/Outlets.model';
import PanelUpgradeReplacementModel from './PanelUpgradeReplacement/PanelUpgradeReplacement.model';
import RemodelingModel from './Remodeling/Remodeling.model';
import ServiceCallModel from './ServiceCall/ServiceCall.model';
import StarlinkModel from './Starlink/Starlink.model';
import SwitchesModel from './Switches/Switches.model';

export type TServiceModelEntry = { name: string; model: Model<any> };

export const serviceModelEntries: TServiceModelEntry[] = [
  { name: 'AccessoryBuildingPower', model: AccessoryBuildingPowerModel },
  { name: 'DedicatedCircuit', model: DedicatedCircuitModel },
  { name: 'CellingFans', model: CellingFansModel },
  { name: 'DockPower', model: DockPowerModel },
  { name: 'Electric', model: ElectricModel },
  { name: 'EVChargerInstallation', model: EVChargerInstallationModel },
  { name: 'ExhaustFans', model: ExhaustFansModel },
  { name: 'Generator', model: GenaratorModel },
  { name: 'HomeSurgeProtection', model: HomeSurgeProtectionModel },
  { name: 'HotTub', model: HotTubModel },
  { name: 'Lighting', model: LightingModel },
  { name: 'NewConstruction', model: NewConstructionModel },
  { name: 'Outlets', model: OutletsModel },
  { name: 'PanelUpgradeReplacement', model: PanelUpgradeReplacementModel },
  { name: 'Remodeling', model: RemodelingModel },
  { name: 'ServiceCall', model: ServiceCallModel },
  { name: 'Starlink', model: StarlinkModel },
  { name: 'Switches', model: SwitchesModel },
];

// Plain list of the same models (order-independent consumers: Quotes / Admin).
export const serviceModels: Model<any>[] = serviceModelEntries.map(
  entry => entry.model,
);
