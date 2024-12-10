import { Contest_Module_Routes } from "../_routes/Contest_Module_Routes.ts";
import { routeHandler } from "../_routes/Route_Handler.ts"

Deno.serve(async (req) => {
     return await routeHandler(req,Contest_Module_Routes);
})
