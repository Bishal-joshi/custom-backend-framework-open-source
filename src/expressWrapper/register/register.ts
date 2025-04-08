import express, { Request, Response, NextFunction } from "express";
import { MiddlewareChain } from "../middleware/middleware.chain";
import { Middleware } from "../middleware/middleware.interface";

// Register class to bind routes and middlewares
export class Register {
  private static app = express();
  private static port = 3000;

  // Store routes with their middlewares
  static routes: Record<
    string,
    {
      method: string;
      handlerName: string;
      path: string;
      middlewares: MiddlewareChain;
    }
  > = {};

  // Register controllers
  static register(...controllers: any[]) {
    controllers.forEach((controller) => {
      const prototype = controller.prototype;

      // Get all methods from the controller prototype
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          name !== "constructor" && typeof prototype[name] === "function"
      );

      console.log(`Registering methods from controller: ${controller.name}`);

      methodNames.forEach((methodName) => {
        // Get route metadata for the method
        const routeMeta = Reflect.getMetadata("route", prototype, methodName);

        if (!routeMeta) {
          console.warn(
            `No route metadata found for method ${methodName} in controller ${controller.name}`
          );
          return;
        }

        // Store the route with its metadata and middlewares
        Register.routes[methodName] = {
          method: routeMeta.method,
          handlerName: methodName,
          path: routeMeta.path,
          middlewares: new MiddlewareChain(),
        };
      });

      // Register routes with the Express app
      Object.values(Register.routes).forEach((route) => {
        const { method, path, handlerName, middlewares } = route;
        const handler = prototype[handlerName]?.bind(prototype);

        if (!handler) {
          console.error(
            `Handler for ${handlerName} not found on controller ${controller.name}`
          );
          return;
        }

        // Attach the route to the Express app
        Register.app[method.toLowerCase()](
          path,
          (req: Request, res: Response, next: NextFunction) => {
            middlewares.run(req, res, next);
          },
          handler
        );

        console.log(
          `Registered ${method.toUpperCase()} ${path} -> ${handlerName}`
        );
      });
    });

    // Start the server after registering all routes
    Register.startServer();
  }

  // Register middleware for a specific route
  static registerMiddleware(routeName: string, middlewares: Middleware[]) {
    const route = Register.routes[routeName];
    if (!route) {
      console.error(`Route ${routeName} not found.`);
      return;
    }

    middlewares.forEach((middleware) => {
      route.middlewares.addMiddleware(middleware);
      console.log(`Middleware added to route ${routeName}`);
    });
  }

  // Start the Express server
  static startServer() {
    Register.app.listen(Register.port, () => {
      console.log(`🚀 Server is running on http://localhost:${Register.port}`);
    });
  }
}

// import express, { Request, Response, NextFunction } from "express";
// import { MiddlewareChain } from "../middleware/middleware.chain";
// import { Middleware } from "../middleware/middleware.interface";

// // Register class to bind routes and middlewares
// export class Register {
//   private static app = express();
//   private static port = 3000;

//   // Store routes with their middlewares
//   static routes: Record<
//     string,
//     {
//       method: string;
//       handlerName: string;
//       path: string;
//       middlewares: MiddlewareChain;
//     }
//   > = {};

//   // Register controller
//   static register(controller: any) {
//     const prototype = controller.prototype;
//     const methodNames = Object.getOwnPropertyNames(prototype).filter(
//       (name) => name !== "constructor" && typeof prototype[name] === "function"
//     );

//     // Register routes
//     for (const name of methodNames) {
//       const routeMeta = Reflect.getMetadata("route", prototype, name);
//       if (routeMeta) {
//         Register.routes[name] = {
//           method: routeMeta.method,
//           handlerName: name,
//           path: routeMeta.path,
//           middlewares: new MiddlewareChain(),
//         };
//       }
//     }

//     // Register routes to the Express app
//     for (const route of Object.values(Register.routes)) {
//       const { method, path, handlerName, middlewares } = route;
//       const handler = prototype[handlerName].bind(prototype);

//       Register.app[method.toLowerCase()](
//         path,
//         (req: Request, res: Response, next: NextFunction) => {
//           middlewares.run(req, res, next);
//         },
//         handler
//       );
//     }

//     // Start the server
//     Register.startServer();
//     console.log("Registered routes:", Register.routes);
//   }

//   // Register an array of middlewares for a specific route
//   static registerMiddleware(routeName: string, middlewares: Middleware[]) {
//     const route = Register.routes[routeName];
//     if (route) {
//       middlewares.forEach((middleware) => {
//         route.middlewares.addMiddleware(middleware);
//       });
//     } else {
//       console.error(`Route ${routeName} not found.`);
//     }
//   }

//   static startServer() {
//     Register.app.listen(Register.port, () => {
//       console.log(`🚀 Server is running on http://localhost:${Register.port}`);
//     });
//   }
// }
