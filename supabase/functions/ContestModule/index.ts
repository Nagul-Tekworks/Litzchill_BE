import { ContestModuleRoutes } from "../_routes/Contest_module_Routes.ts"
import { routeHandler } from "../_routes/Route_Handler.ts"

Deno.serve(async (req) => {
     return await routeHandler(req,ContestModuleRoutes);
})
