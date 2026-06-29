import { Service_STATUSES } from '../../constants';
import { serviceModelEntries } from '../serviceModels';

const getAllMyDraftsFromDB = async (userId: string) => {
  const draftPromises = serviceModelEntries.map(async ({ name, model }) => {
    const drafts = await model
      .find({
        createdBy: userId,
        status: Service_STATUSES.DRAFT,
      })
      .lean();

    return {
      serviceName: name,
      count: drafts.length,
      data: drafts,
    };
  });

  const results = await Promise.all(draftPromises);

  const filteredResults = results.filter(result => result.count > 0);

  return filteredResults;
};

export const DraftService = {
  getAllMyDraftsFromDB,
};
