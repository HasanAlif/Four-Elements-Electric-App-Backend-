// Payload an admin sends to create a guide (mirrors the required model fields).
export type TCreateGuidePayload = {
  name: string;
  safetyWarnings: string;
  steps: string[];
};

// Common list/pagination query passed through to QueryBuilder.
export type TGuideQuery = {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  searchTerm?: string;
};
