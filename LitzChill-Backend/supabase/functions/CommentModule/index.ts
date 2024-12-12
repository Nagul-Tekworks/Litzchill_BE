import { routeHandler } from "../_routes/Route_Handler.ts"
import { CommentModuleRoutes } from "../_routes/Comment_Module_Routes.ts";

Deno.serve(async (req) => {
  return await routeHandler(req,CommentModuleRoutes);
})