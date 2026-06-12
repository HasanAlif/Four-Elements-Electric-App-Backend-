import { z } from 'zod';
import { Service_STATUSES } from '../../constants';
import {
  DOCK_POWER_CIRCUIT_AMP_RATINGS,
  DOCK_POWER_CIRCUIT_COUNTS,
  DOCK_POWER_CONTACT_METHODS,
  DOCK_POWER_NEW_SERVICE_SIZES,
  DOCK_POWER_OWNERSHIP_STATUSES,
  DOCK_POWER_PANEL_LOCATIONS,
  DOCK_POWER_PROPERTY_TYPES,
  DOCK_POWER_SERVICE_TYPES,
  DOCK_POWER_SUB_PANEL_SIZES,
  DOCK_POWER_TIMELINE_URGENCIES,
} from './DockPower.interface';

const dockPowerBodySchema = z.object({
  fullName: z.string({ error: 'Full name is required!' }).min(1),
  phoneNumber: z.string({ error: 'Phone number is required!' }).min(1),
  emailAddress: z.string().email('Invalid email format!').optional(),
  preferredContactMethod: z.enum(DOCK_POWER_CONTACT_METHODS).optional(),

  streetAddress: z.string({ error: 'Street address is required!' }).min(1),
  apartmentUnit: z.string().optional(),
  city: z.string({ error: 'City is required!' }).min(1),
  state: z.string({ error: 'State is required!' }).min(1),
  zipCode: z.string({ error: 'ZIP code is required!' }).min(1),

  propertyType: z.enum(DOCK_POWER_PROPERTY_TYPES),
  ownershipStatus: z.enum(DOCK_POWER_OWNERSHIP_STATUSES),
  timelineUrgency: z.enum(DOCK_POWER_TIMELINE_URGENCIES),

  isDockBuilt: z.boolean({
    error: 'Please choose whether your dock is already built!',
  }),
  electricalNeedsDetails: z
    .string({ error: 'Electrical need details are required!' })
    .min(1),
  receptacleCount: z.coerce
    .number({ error: 'Receptacle count is required!' })
    .min(0, 'Receptacle count cannot be negative!'),

  electricalServiceType: z.enum(DOCK_POWER_SERVICE_TYPES),
  newServiceSize: z.enum(DOCK_POWER_NEW_SERVICE_SIZES).optional(),
  subPanelSize: z.enum(DOCK_POWER_SUB_PANEL_SIZES).optional(),
  serviceSizeOther: z.string().optional(),
  dedicatedCircuitsCount: z.enum(DOCK_POWER_CIRCUIT_COUNTS).optional(),
  dedicatedCircuitAmpRating: z.enum(DOCK_POWER_CIRCUIT_AMP_RATINGS).optional(),

  panelLocation: z.enum(DOCK_POWER_PANEL_LOCATIONS),
  panelLocationOther: z.string().optional(),

  panelPhotos: z.array(z.string()).optional(),
  privateUtilitiesDetails: z.string().optional(),
  routeDistanceDetails: z.string().optional(),
  existingSpacePhotos: z.array(z.string()).optional(),

  hasPlansDrawings: z.boolean({
    error: 'Please choose whether you have plans/drawings!',
  }),
  plansDrawingsPhotos: z.array(z.string()).optional(),
  permitApplied: z.boolean({
    error: 'Please choose whether a permit has been applied for!',
  }),
  permitNumber: z.string().optional(),
  additionalInformation: z.string().optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

const dockPowerCreateBodySchema = dockPowerBodySchema.extend({
  panelPhotos: z
    .array(z.string())
    .min(1, 'Please upload clear photo(s) of electrical panel!'),
  existingSpacePhotos: z
    .array(z.string())
    .min(1, 'Please upload photo(s) of the existing space!'),
});

const validateDockPowerConditionalFields = (
  data: {
    electricalServiceType?: (typeof DOCK_POWER_SERVICE_TYPES)[number];
    newServiceSize?: (typeof DOCK_POWER_NEW_SERVICE_SIZES)[number];
    subPanelSize?: (typeof DOCK_POWER_SUB_PANEL_SIZES)[number];
    serviceSizeOther?: string;
    dedicatedCircuitsCount?: (typeof DOCK_POWER_CIRCUIT_COUNTS)[number];
    dedicatedCircuitAmpRating?: (typeof DOCK_POWER_CIRCUIT_AMP_RATINGS)[number];
    panelLocation?: (typeof DOCK_POWER_PANEL_LOCATIONS)[number];
    panelLocationOther?: string;
    hasPlansDrawings?: boolean;
    plansDrawingsPhotos?: string[];
    permitApplied?: boolean;
    permitNumber?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.electricalServiceType === 'New service' && !data.newServiceSize) {
    ctx.addIssue({
      code: 'custom',
      path: ['newServiceSize'],
      message: 'Service size is required for new service!',
    });
  }

  if (data.electricalServiceType === 'Sub-panel' && !data.subPanelSize) {
    ctx.addIssue({
      code: 'custom',
      path: ['subPanelSize'],
      message: 'Sub-panel size is required!',
    });
  }

  if (
    (data.newServiceSize === 'Other' || data.subPanelSize === 'Other') &&
    !data.serviceSizeOther
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['serviceSizeOther'],
      message: 'Please specify the service size when choosing Other!',
    });
  }

  if (
    data.electricalServiceType === '1-2 dedicated circuits' &&
    !data.dedicatedCircuitsCount
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['dedicatedCircuitsCount'],
      message: 'Please choose whether you need 1 or 2 dedicated circuits!',
    });
  }

  if (
    data.electricalServiceType === '1-2 dedicated circuits' &&
    !data.dedicatedCircuitAmpRating
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['dedicatedCircuitAmpRating'],
      message: 'Please choose amp rating for the circuit(s)!',
    });
  }

  if (
    data.panelLocation === 'Other (please specify)' &&
    !data.panelLocationOther
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['panelLocationOther'],
      message: 'Please specify your panel location!',
    });
  }

  if (data.hasPlansDrawings === true && !data.plansDrawingsPhotos?.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['plansDrawingsPhotos'],
      message: 'Please upload the plans/drawings!',
    });
  }

  if (data.permitApplied === true && !data.permitNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['permitNumber'],
      message: 'Permit number is required when a permit has been applied for!',
    });
  }
};

export const DockPowerValidation = {
  createSchema: z.object({
    body: dockPowerCreateBodySchema.superRefine(
      validateDockPowerConditionalFields,
    ),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z
        .string({
          error: 'Dock power request ID is required!',
        })
        .min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z
        .string({
          error: 'Dock power request ID is required!',
        })
        .min(1),
    }),
    body: dockPowerBodySchema
      .partial()
      .extend({
        status: z.enum(Service_STATUSES).optional(),
      })
      .refine(
        data =>
          Object.values(data).some(
            value => value !== undefined && value !== null,
          ),
        { message: 'At least one field is required to update!' },
      )
      .superRefine(validateDockPowerConditionalFields),
  }),
};
