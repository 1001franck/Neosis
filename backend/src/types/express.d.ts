import * as express from "express";
import 'i18next-http-middleware';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};