import { Request, Response, NextFunction } from "express";
import { Middleware } from "./middleware.interface";

// Middleware Chain to manage the middlewares
export class MiddlewareChain {
  private middlewares: Middleware[] = [];

  // Add middleware to the chain
  addMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  // Execute middlewares in order
  run(request: Request, response: Response, next: NextFunction) {
    const execute = (index: number) => {
      if (index < this.middlewares.length) {
        this.middlewares[index].handle(request, response, () =>
          execute(index + 1)
        );
      } else {
        next(); // All middleware passed, proceed to the route handler
      }
    };
    execute(0); // Start executing the chain
  }
}
