import { routeHandler } from "../_routes/Route_Handler.ts"
import { FlagModuleRoutes } from "../_routes/Flag_Module_Routes.ts"

Deno.serve(async (req) => {
  return await routeHandler(req,FlagModuleRoutes);
})

