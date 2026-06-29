import config from '../config';

class AppError extends Error {
  public data: null = null;
  public success: boolean = false;

  constructor(
    public statusCode: number,
    message: string = 'Something went wrong!',
    public meta: Record<string, unknown> = {},
  ) {
    super(message);

    if (config.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
