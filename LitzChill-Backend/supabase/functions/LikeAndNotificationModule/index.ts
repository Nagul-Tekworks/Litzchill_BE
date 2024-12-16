import { like_And_NotifyRoutes } from "../_routes/LikeandNotification_Routes.ts";
import { routeHandler } from "../_routes/Route_Handler.ts";



Deno.serve(async (req) => {
  return await routeHandler(req,like_And_NotifyRoutes);
  });
  

