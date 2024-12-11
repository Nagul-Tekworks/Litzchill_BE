
import logoutUser from "../_handler/_user_module/Logout.ts";  
import signInWithOtp from "../_handler/_user_module/SendOTP.ts";
import verifyOtp from "../_handler/_user_module/verifyOtp.ts";
import { HTTP_METHOD } from "../_shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "../_shared/_constants/UserRoles.ts";
import updateUserProfile from "../_handler/_user_module/ProfileUpdatae.ts";
import { checkUserAuthentication } from "../_middleware/middlerWare.ts";

import { DeactivateAccount } from "../_handler/_user_module/DeactivateAccount.ts";
import FetchUserProfile from "../_handler/_user_module/FetchUser.ts";

const userModuleRoute = {
  SendOtpPath: "/UserModule/sendOtp",
  VerifyOtp: "/UserModule/verifyOtp",
  UpdateUser: "/UserModule/userUpdate/:id",
  FetchUser: "/UserModule/FetchUser/:id",
  DeactivateUser: "/UserModule/Deactivate/:id",  // Fixed double slash
  UserLogOut: "/UserModule/LogOut"
};

// Mapping all the routes in one place
export const UserModuleRoutes = {
  [HTTP_METHOD.POST]: {
    [userModuleRoute.SendOtpPath]: signInWithOtp,
    [userModuleRoute.VerifyOtp]: verifyOtp,
    [userModuleRoute.UserLogOut]: checkUserAuthentication(
      logoutUser,
      [USER_ROLES.ADMIN_ROLE, USER_ROLES.USER_ROLE]
    )
},
[HTTP_METHOD.PATCH]:{
    [userModuleRoute.UpdateUser]:checkUserAuthentication(
        updateUserProfile,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE,
            USER_ROLES.USER_ROLE
            
        ]
    ),
    [userModuleRoute.DeactivateUser]:checkUserAuthentication(
        DeactivateAccount,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE,
            USER_ROLES.USER_ROLE
        ]
    )
},
[HTTP_METHOD.GET]:{
    [userModuleRoute.FetchUser]:checkUserAuthentication(
        FetchUserProfile,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE,
            USER_ROLES.USER_ROLE
        ]
    )
}


}