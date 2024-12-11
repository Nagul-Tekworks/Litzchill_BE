import { routeHandler } from "../_routes/Route_Handler.ts";
import { UserModuleRoutes } from "../_routes/UserRoutesAndPaths.ts";

  Deno.serve(async (req: Request) => {
  
    return await routeHandler(req,UserModuleRoutes)
    
    });

