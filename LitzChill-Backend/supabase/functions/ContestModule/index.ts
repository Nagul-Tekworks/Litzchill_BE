import { Contest_Module_Routes } from "../_routes/Contest_Module_Routes.ts";
import { routeHandler } from "../_routes/Route_Handler.ts"

/**
 * Recieving Request 
 * @param req ->Http Request.
 * @returns {Response object}->Return Response Object either Success or failure.
 * 
 * -Calling route handler to handler appropriate route and base on route route will call handler
 */
Deno.serve(async (req) => {
     console.log('INFO: Request Recieved In Index Calling Route Handler')
     return await routeHandler(req,Contest_Module_Routes);
})
