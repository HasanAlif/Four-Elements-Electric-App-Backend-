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

    return drafts.map(draft => ({ serviceName: name, ...draft }));
  });

  const results = await Promise.all(draftPromises);
  const allDrafts = results.flat();

  allDrafts.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return allDrafts;
};

export const DraftService = {
  getAllMyDraftsFromDB,
};
