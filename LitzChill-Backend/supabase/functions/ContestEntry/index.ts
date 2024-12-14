import { ContestEntryRoutes } from "../_routes/ContestEntry_Module_Routes.ts";
import { routeHandler } from "../_routes/Route_Handler.ts";

Deno.serve(async (req) => {
  return await routeHandler(req,ContestEntryRoutes);
});



