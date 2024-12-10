import { handleCreateContext } from "../_handler/_contest_module/CreateContest.ts";
import { checkUserAuthentication } from "../_middleware/middlerWare.ts";
import { HTTP_METHOD } from "../_shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "../_shared/_constants/UserRoles.ts";
import { CONTEST_ROUTES } from "./RoutesPaths.ts";


//define all routes for Contest Module
export const ContestModuleRoutes={

    //POST Method Related Routes
    [HTTP_METHOD.POST]:{
        [CONTEST_ROUTES.CONTEST_CREATE_PATH]:checkUserAuthentication(
                handleCreateContext ,
                [
                    USER_ROLES.ADMIN_ROLE
                ]
            )

    }
    // ,
    //  //GET Method Related Routes
    // [HTTP_METHOD.GET]:{
    //     [CONTEST_ROUTES.CONTEST_GET_ALL_PATH]:
    //         handlegetAllContest,
           
    //     [CONTEST_ROUTES.CONTEST_GET_BY_ID_PATH]:
    //         handlegetContestById,
           
    // }
    // ,
    //  //DELETE Method Related Routes
    // [HTTP_METHOD.DELETE]:{
    //     [CONTEST_ROUTES.CONTEST_DELETE_BY_ID_PATH]:
    //         handleDeleteContest,
           
    // }
    // ,
    //  //PATCH Method Related Routes
    // [HTTP_METHOD.PATCH]:{
    //     [CONTEST_ROUTES.CONTEST_UPDATE_BY_ID_PATH]:
    //          handleupdateContestDetails,
    // }

}