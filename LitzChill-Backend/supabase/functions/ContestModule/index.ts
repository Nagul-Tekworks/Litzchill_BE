import { Contest_Module_Routes } from "../_routes/Contest_Module_Routes.ts";
import { routeHandler } from "../_routes/Route_Handler.ts"

Deno.serve(async (req) => {
     console.log('INFO: Request Recieved In Index Calling Route Handler')
     return await routeHandler(req,Contest_Module_Routes);
})
