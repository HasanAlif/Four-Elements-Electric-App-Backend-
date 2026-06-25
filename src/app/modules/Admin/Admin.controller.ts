import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AdminService } from './Admin.service';

// Accept a query-string filter only if it is actually a string; an object/array
// (e.g. ?serviceType[$ne]=x) is dropped so it can never reach a Mongo filter.
const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const getAllQuotes = asyncHandler(async (req: Request, res: Response) => {
  const { status, serviceType, searchQuery, page, limit } = req.query;

  const result = await AdminService.getAllQuotes({
    status: asString(status),
    serviceType: asString(serviceType),
    searchQuery: asString(searchQuery),
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'All quotes retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleQuote = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getSingleQuote(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Quote retrieved successfully!',
    data,
  });
});

const updateQuoteStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, internalNote } = req.body;

  const data = await AdminService.updateQuoteStatus(req.params.id as string, {
    status,
    internalNote,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Quote updated successfully!',
    data,
  });
});

const getQouteForUpdate = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getQouteForUpdate(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Quote retrieved successfully!',
    data,
  });
});

const getQoutesCount = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getQoutesCount();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Quotes count retrieved successfully!',
    data,
  });
});

const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.createCategory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Category created successfully!',
    data,
  });
});

const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getAllCategories();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Categories retrieved successfully!',
    data,
  });
});

const getSingleCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getSingleCategory(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category retrieved successfully!',
    data,
  });
});

const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.updateCategory(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category updated successfully!',
    data,
  });
});

const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.deleteCategory(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category deleted successfully!',
    data,
  });
});

const createPartner = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.createPartner(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Partner created successfully!',
    data,
  });
});

const getAllPartner = asyncHandler(async (req: Request, res: Response) => {
  const { searchQuery, category, status } = req.query;

  const data = await AdminService.getAllPartner({
    searchQuery: asString(searchQuery),
    category: asString(category),
    status: asString(status),
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Partners retrieved successfully!',
    data,
  });
});

const getSinglePartner = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getSinglePartner(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Partner retrieved successfully!',
    data,
  });
});

const updatePartner = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.updatePartner(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Partner updated successfully!',
    data,
  });
});

const deletePartner = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.deletePartner(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Partner deleted successfully!',
    data,
  });
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.changePassword(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully!',
    data,
  });
});

const getAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getAdminProfile(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin profile retrieved successfully!',
    data,
  });
});

const createAdminUserBySuperAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.createAdminUserBySuperAdmin(
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Admin user created successfully!',
      data,
    });
  },
);

const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;

  const result = await AdminService.getAllAdmins(asString(status));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin users retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAdmin = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getSingleAdmin(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin user retrieved successfully!',
    data,
  });
});

const updateAdminUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.updateAdminUserStatus(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Admin user status updated successfully!',
      data,
    });
  },
);

const deleteAdminUserBySuperAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.deleteAdminUserBySuperAdmin(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Admin user deleted successfully!',
      data,
    });
  },
);

const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dashboard stats retrieved successfully!',
    data,
  });
});

const getQouteStatsOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.getQouteStatsOverview();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Quote stats overview retrieved successfully!',
      data,
    });
  },
);

const quoteSubmissionTrend = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.quoteSubmissionTrend();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Quote submission trend retrieved successfully!',
      data,
    });
  },
);

const serviceTypeDistribution = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.serviceTypeDistribution();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Service type distribution retrieved successfully!',
      data,
    });
  },
);

const partnerVerificationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.partnerVerificationStats();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Partner verification stats retrieved successfully!',
      data,
    });
  },
);

const recentPartnersUpdates = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AdminService.recentPartnersUpdates();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Recent partners updates retrieved successfully!',
      data,
    });
  },
);

const adminActionSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.adminActionSummary();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin action summary retrieved successfully!',
    data,
  });
});

export const AdminController = {
  getAllQuotes,
  getSingleQuote,
  updateQuoteStatus,
  getQouteForUpdate,
  getQoutesCount,
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  createPartner,
  getAllPartner,
  getSinglePartner,
  updatePartner,
  deletePartner,
  changePassword,
  getAdminProfile,
  createAdminUserBySuperAdmin,
  getAllAdmins,
  getSingleAdmin,
  updateAdminUserStatus,
  deleteAdminUserBySuperAdmin,
  getDashboardStats,
  getQouteStatsOverview,
  quoteSubmissionTrend,
  serviceTypeDistribution,
  partnerVerificationStats,
  recentPartnersUpdates,
  adminActionSummary,
};
