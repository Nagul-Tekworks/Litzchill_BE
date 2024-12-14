import { handleAddFlagRequest } from "../_handler/_flag_module/AddFlag.ts";
import { checkUserAuthentication } from "../_middleware/middlerWare.ts";
import { HTTP_METHOD } from "../_shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "../_shared/_constants/UserRoles.ts";
import { FLAG_ROUTES } from "./RoutesPaths.ts";



/**
 * Defines all the routes for the Flag Module.
 * 
 * This configuration object maps HTTP methods (POST) to their respective routes and handlers,
 * along with the necessary user roles for authentication.
 */

export const FlagModuleRoutes={

    //POST Method Related Routes
    [HTTP_METHOD.POST]:{
        [FLAG_ROUTES.ADD_FLAG_TO_MEME]:checkUserAuthentication( 
            handleAddFlagRequest,
            [
                  USER_ROLES.ADMIN_ROLE,
                  USER_ROLES.USER_ROLE,
                  USER_ROLES.MEMER_ROLE,
                  USER_ROLES.VIEWER_ROLE
            ]
        )
           
    }
}