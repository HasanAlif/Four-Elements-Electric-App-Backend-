export type TCreateGuidePayload = {
  name: string;
  safetyWarnings: string;
  steps: { subtitle: string; description: string }[];
};

export type TGuideQuery = {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  searchTerm?: string;
};
