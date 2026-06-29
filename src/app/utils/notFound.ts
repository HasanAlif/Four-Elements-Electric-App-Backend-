import { NextFunction, Request, Response } from 'express';

const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'API not found!',
    errorSources: [
      {
        path: req.originalUrl,
        message: 'Your requested API endpoint not found!',
      },
    ],
  });
};

export default notFoundHandler;
