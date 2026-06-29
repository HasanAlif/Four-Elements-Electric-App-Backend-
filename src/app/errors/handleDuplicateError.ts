import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const statusCode = 400;

  const match = err.message.match(/"([^"]*)"/);

  const extractedMessage = match?.[1];

  const errorSources: TErrorSources = [
    {
      path: '',
      message: extractedMessage
        ? `${extractedMessage} is already exists!`
        : 'Duplicate field value already exists!',
    },
  ];

  return {
    statusCode,
    message: 'Duplicate Error!',
    errorSources,
  };
};

export default handleDuplicateError;
