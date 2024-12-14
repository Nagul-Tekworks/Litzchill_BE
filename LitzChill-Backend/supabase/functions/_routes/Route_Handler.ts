
import {ErrorResponse} from "../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../_shared/_messages/ErrorMessages.ts";


/**
 * Handles routing for incoming requests, matching the HTTP method and URL path to a handler function.
 * It supports both static and dynamic routing.
 * 
 * @param req - The incoming request object.
 * @param routes - The object containing route definitions, mapping methods and paths to handlers.
 * 
 * @returns {Promise<Response>}A response from the matched handler or an error response if no match is found.
 */

export async function routeHandler(req:Request,routes:Record<string,any>):Promise<Response>{

        const method = req.method;
        const url = new URL(req.url);
        const path = url.pathname;
        console.log(`INFO: Request received in route handler - Method: ${method}, Path: ${path}`);

       //gethering all routes path into single array
        const allRoutes = Object.values(routes).flatMap((allPresentRoutes) =>
          Object.keys(allPresentRoutes)
        );


         console.log(`INFO: all presented routes keys(path): ,${allRoutes}`);

        const allMatchedMethodRoutes=routes[method];

        console.log(`INFO: ALl matched routes: `,allMatchedMethodRoutes );

        //if method is not match is undefined then we are returning method not allowed
        if(allMatchedMethodRoutes==undefined){
             console.error(`ERROR: Provided Method not matched with any presented routes`)
              return ErrorResponse(
                 HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
                 COMMON_ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                )
        }

        //checking our path is present into path key array 
        if(allRoutes.includes(path)){
          if (!allMatchedMethodRoutes || !allMatchedMethodRoutes?.[path]) {
                 console.error(`ERROR: Method '${method}' not allowed for route '${path}'`);
                 return ErrorResponse(
                     HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
                     COMMON_ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                    )
            }  
        }

        //checking for static routes if present then calling handler
        if (allMatchedMethodRoutes[path]) {
          console.log(`INFO: Static Route Matched calling handler`)
            return await allMatchedMethodRoutes[path](req);
        }

        //checking for dyanamic route matching 
        console.log(`INFO: Checking for dynamic route`)
        for (const routePattern in allMatchedMethodRoutes) {
          //"/ContestModule/getContestById/:id"
          //"/ContestModule/getContestById/:4556555"
            const param = extractParameter(routePattern, path);
            if (param) {
                 //calling handler if path is correct 
                 console.log(`INFO: Dynamic Route matched calling handler`)
                // const handler=allMatchedMethodRoutes[routePattern]
                 return await allMatchedMethodRoutes[routePattern](req, param);
            } 
         }

         //again checking after dynamic route if route is present but method not supported
         const trimmedPath = path.split('/').slice(0, -1).join('/')+'/:id';
         console.log("trimmed path",trimmedPath);
          if(allRoutes.includes(trimmedPath)){
            console.error(`ERROR: Method '${method}' not allowed for route '${path}'`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
                 COMMON_ERROR_MESSAGES.METHOD_NOT_ALLOWED,
               )
          }  
        
          console.error(`ERROR: Route not found for path ${path}`);
          //returning route not found response
        return ErrorResponse(
             HTTP_STATUS_CODE.NOT_FOUND,
             COMMON_ERROR_MESSAGES.ROUTE_NOT_FOUND,
            
        )
}




/**
 * Extracts dynamic parameters from a URL path based on a route pattern.
 *
 * @param routePattern - The route pattern (e.g., `/user/:id`).
 * @param path - The actual path (e.g., `/user/123`)
 * @returns{:Record<string, string>|null} 
 * - An object containing extracted parameters (e.g., `{ id: "123" }`), or `null` if the path does not match.
 */

export function extractParameter(routePattern: string, path: string):Record<string, string>|null {
  
       const routePath = routePattern.split("/");
       const actualPath = path.split("/");

      // Return null if path lengths do not match
        if (routePath.length !== actualPath.length) {
            console.log(`INFO: Paths length not matched returning null`);
             return null;
        }
                          //id         //12345
        const params: Record<string, string> = {};

        for (let i = 0; i < routePath.length; i++) {
           if (routePath[i].startsWith(":")) {
              const paramName = routePath[i].slice(1);//removing : from route path
              params[paramName] = actualPath[i];
              console.log(`INFO: Extracted parameter: ${paramName} = ${actualPath[i]}`);
            } 
            else if (routePath[i] !== actualPath[i]) {
                  console.log(`INFO: Mismatch at position ${i}: expected ${routePath[i]} but found ${actualPath[i]} returning null`);
                  return null;
            }
        }
        //example :{id:12220}
        return params;

}



