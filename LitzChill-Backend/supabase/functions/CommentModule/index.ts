import { routeHandler } from "../_routes/Route_Handler.ts"
import { CommentModuleRoutes } from "../_routes/Comment_Module_Routes.ts";

/**
 * Recieving Request
 * @param req ->Http Request.
 * @returns {Response object}->Return Response Object either Success or failure.
 * 
 * -Calling route handler to handler appropriate route and base on route route will call handler
 */
Deno.serve(async (req) => {
   //calling handler to match provided path with our routes
  console.log('INFO: Request Recieved In Index Calling Route Handler')
  return await routeHandler(req,CommentModuleRoutes);
})