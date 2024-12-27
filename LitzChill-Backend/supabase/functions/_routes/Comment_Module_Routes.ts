import { handleAddComment } from "@handler/_comment_module/AddComment.ts";
import { handleDeleteComment } from "@handler/_comment_module/DeleteComment.ts";
import { checkUserAuthentication } from "@middleware/middlerWare.ts";
import { HTTP_METHOD } from "@shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";
import { COMMENT_ROUTES } from "./RoutesPaths.ts";




/**
 * Defines all the routes for the Comment Module.
 * 
 * This configuration object maps HTTP methods (POST and DELETE) to their respective routes and handlers,
 * along with the necessary user roles for authentication.
 */
export const CommentModuleRoutes={

  //POST Method Related Routes
    [HTTP_METHOD.POST]:{
        [COMMENT_ROUTES.COMMENT_ADD_PATH]:checkUserAuthentication(
                 handleAddComment,
                 [
                        USER_ROLES.ADMIN_ROLE,
                        USER_ROLES.MEMER_ROLE,
                        USER_ROLES.USER_ROLE,
                        USER_ROLES.VIEWER_ROLE
                 ]
        )
    
    },
    //Delete Method Related Routes
    [HTTP_METHOD.DELETE]:{
        [COMMENT_ROUTES.COMMENT_DELETE_BY_ID_PATH]:checkUserAuthentication(
              handleDeleteComment,
              [
                        USER_ROLES.ADMIN_ROLE,
                        USER_ROLES.USER_ROLE,
              ]
        )
    }


}