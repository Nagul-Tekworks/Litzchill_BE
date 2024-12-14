import get_Contest_Data from "../_handler/_contestentry_module/retriveContestEntry.ts";
import handleSubmitContestEntry from "../_handler/_contestentry_module/createContestEntryHandler.ts";
import update_Contest_entry from "../_handler/_contestentry_module/updateContestHandler.ts";
import { checkUserAuthentication } from "../_middleware/middlerWare.ts";
import { USER_ROLES } from "../_shared/_constants/UserRoles.ts";
import { CONTEST_ENTRY_ROUTES } from "./RoutesPaths.ts";





export const ContestEntryRoutes={
    POST:{
        [CONTEST_ENTRY_ROUTES.POST_CONTEST_ENTRY]:checkUserAuthentication(
                handleSubmitContestEntry,
                [
                    USER_ROLES.ADMIN_ROLE,USER_ROLES.USER_ROLE,USER_ROLES.MEMER_ROLE
                ]
        )
    },
    GET:{
        [CONTEST_ENTRY_ROUTES.GET_CONTEST_ENTRY]:checkUserAuthentication(
            get_Contest_Data,
                [
                    USER_ROLES.ADMIN_ROLE,USER_ROLES.USER_ROLE
                ]
        )
     },
    PATCH:{
        [CONTEST_ENTRY_ROUTES.UPDATE_CONTEST_ENTRY]:checkUserAuthentication(
            update_Contest_entry,
            [
                USER_ROLES.ADMIN_ROLE
            ]
        )        
    }
}