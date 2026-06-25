import httpStatus from 'http-status';
import { AppError } from '../../utils';
import FAQModel from './FAQ.model';
import { AppContent, ContentType } from './appContent.model';

type TFAQPayload = {
  question: string;
  answer: string;
};

const createFAQ = async (payload: TFAQPayload) => {
  return FAQModel.create(payload);
};

const getAllFAQs = async () => {
  return FAQModel.find().sort({ createdAt: -1 });
};

const getSingleFAQ = async (id: string) => {
  const faq = await FAQModel.findById(id);

  if (!faq) {
    throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found!');
  }

  return faq;
};

const updateFAQ = async (id: string, payload: Partial<TFAQPayload>) => {
  const faq = await FAQModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found!');
  }

  return faq;
};

const deleteFAQ = async (id: string) => {
  const faq = await FAQModel.findByIdAndDelete(id);

  if (!faq) {
    throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found!');
  }

  return faq;
};

const getContentTypeName = (type: ContentType): string => {
  const typeNames: Record<ContentType, string> = {
    [ContentType.ABOUT_US]: 'About Us',
    [ContentType.TERMS_AND_CONDITIONS]: 'Terms and Conditions',
  };
  return typeNames[type] || type;
};

const createOrUpdateContent = async (type: ContentType, content: string) => {
  const result = await AppContent.findOneAndUpdate(
    { type },
    { content },
    { new: true, upsert: true, runValidators: true },
  );
  return result;
};

const getContentByType = async (type: ContentType) => {
  const result = await AppContent.findOne({ type });
  if (!result) {
    return {
      _id: null,
      type,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  return result;
};

export const FAQService = {
  createFAQ,
  getAllFAQs,
  getSingleFAQ,
  updateFAQ,
  deleteFAQ,
  getContentTypeName,
  createOrUpdateContent,
  getContentByType,
};
