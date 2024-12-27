import { handleCreateContext } from "@handler/_contest_module/CreateContest.ts";
import { handleDeleteContest } from "@handler/_contest_module/DeleteContest.ts";
import { handlegetAllContest } from "@handler/_contest_module/GetAllContest.ts";
import { handlegetContestById } from "@handler/_contest_module/GetContestById.ts";
import { handleupdateContest } from "@handler/_contest_module/UpdateContest.ts";
import { checkUserAuthentication } from "@middleware/middlerWare.ts";
import { HTTP_METHOD } from "@shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";
import { CONTEST_ROUTES } from "./RoutesPaths.ts";



/**
 * Defines all the routes for the Contest Module.
 * 
 * This configuration object maps HTTP methods (POST ,GET,PATCH and DELETE) to their respective routes and handlers,
 * along with the necessary user roles for authentication.
 */
export const Contest_Module_Routes={

    //POST Method Related Routes
    [HTTP_METHOD.POST]:{
        [CONTEST_ROUTES.CONTEST_CREATE_PATH]:checkUserAuthentication(
                handleCreateContext ,
                [
                     USER_ROLES.ADMIN_ROLE
                ]
            ),     
    }
    ,
     //GET Method Related Routes
    [HTTP_METHOD.GET]:{
        [CONTEST_ROUTES.CONTEST_GET_ALL_PATH]:checkUserAuthentication(
               handlegetAllContest,
               [
                     USER_ROLES.ADMIN_ROLE,
                     USER_ROLES.USER_ROLE
               ]
            ),
           
        [CONTEST_ROUTES.CONTEST_GET_BY_ID_PATH]:checkUserAuthentication(
               handlegetContestById,
               [
                     USER_ROLES.ADMIN_ROLE,
                     USER_ROLES.USER_ROLE
               ]
         ),
    }
    ,
     //DELETE Method Related Routes
    [HTTP_METHOD.DELETE]:{
        [CONTEST_ROUTES.CONTEST_DELETE_BY_ID_PATH]:checkUserAuthentication(
                handleDeleteContest,
                [
                     USER_ROLES.ADMIN_ROLE,
                ]
        )
    }
    ,
     //PATCH Method Related Routes
    [HTTP_METHOD.PATCH]:{
        [CONTEST_ROUTES.CONTEST_UPDATE_BY_ID_PATH]:checkUserAuthentication(
               handleupdateContest,
               [
                     USER_ROLES.ADMIN_ROLE,
               ]
        )
    }

}


