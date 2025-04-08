import { Request, Response, NextFunction } from "express";
export interface Middleware {
  handle(request: Request, response: Response, next: NextFunction): void;
}
