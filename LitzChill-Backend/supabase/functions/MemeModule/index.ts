import { MemeRoutes } from "../_routes/Meme_Module_Routes.ts";
import { routeHandler } from "../_routes/Route_Handler.ts";



Deno.serve(async (req) => {
  return await routeHandler(req,MemeRoutes);
  });
  

