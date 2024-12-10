import { handleCreateContext } from "../_handler/_contest_module/CreateContest.ts";
import { handleDeleteContest } from "../_handler/_contest_module/DeleteContest.ts";
import { handlegetAllContest } from "../_handler/_contest_module/GetAllContest.ts";
import { handlegetContestById } from "../_handler/_contest_module/GetContestById.ts";
import { handleupdateContest } from "../_handler/_contest_module/UpdateContest.ts";
import { checkUserAuthentication } from "../_middleware/middlerWare.ts";
import { HTTP_METHOD } from "../_shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "../_shared/_constants/UserRoles.ts";

//define all contest routes 
export const CONTEST_ROUTES = {
    CONTEST_CREATE_PATH: "/ContestModule/createContest",
    CONTEST_GET_ALL_PATH: "/ContestModule/getAllContest",
    CONTEST_GET_BY_ID_PATH: "/ContestModule/getContestById/:id",
    CONTEST_UPDATE_BY_ID_PATH: "/ContestModule/updateContestById/:id",
    CONTEST_DELETE_BY_ID_PATH: "/ContestModule/deleteContestById/:id",
}


//define all routes for Contest Module
export const Contest_Module_Routes={

    //POST Method Related Routes
    [HTTP_METHOD.POST]:{
        [CONTEST_ROUTES.CONTEST_CREATE_PATH]:checkUserAuthentication(
                handleCreateContext ,
                [
                     USER_ROLES.ADMIN_ROLE
                ]
            )
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


