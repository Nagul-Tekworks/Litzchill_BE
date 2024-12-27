import { routeHandler } from "@routes/Route_Handler.ts"
import { CommentModuleRoutes } from "@routes/Comment_Module_Routes.ts";
import { Logger } from "@shared/_logger/Logger.ts";

/**
 * Recieving Request
 * @param req ->Http Request.
 * @returns {Response object}->Return Response Object either Success or failure.
 * 
 * -Calling route handler to handler appropriate route and base on route route will call handler
 */
Deno.serve(async (req) => {
  const logger = Logger.getloggerInstance();
  //calling route handler to match provided path with our routes
  logger.info('Request Recieved In Index Calling Route Handler')
  return await routeHandler(req, CommentModuleRoutes);
})