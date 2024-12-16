import { routeHandler } from "../_routes/Route_Handler.ts";
import { USER_MODULE_ROUTESs } from "../_routes/UserRoutesAndPaths.ts";

  Deno.serve(async (req: Request) => {
  
    return await routeHandler(req,USER_MODULE_ROUTESs)
    
    });

