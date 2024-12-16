import { UserProfile } from "../../_model/UserModel.ts";
import { getUserProfile, updateProfile } from "../../_repository/_user_repo/UserRepository.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { validatingUserId } from "../../_shared/_validation/UserValidate.ts";
import { LOGERROR,LOGINFO } from "../../_shared/_messages/userModuleMessages.ts";

/**
 * This method can update user profile by user_id
 * @param req --It is a JSON object Request
 * @param params --Params contain user_id, user_jwt, user account status, user_type
 * @returns -- It will return Response object in the form of JSON
 */
export default async function updateUserProfile(req: Request, params: Record<string, string>): Promise<Response> {
    try {
        const id = params.id;
        console.log(LOGINFO.PROFILE_UPDATE_STARTED.replace("{userId}", id));

        // Validate user ID
        const idAvailable = await validatingUserId(id);
        if (idAvailable instanceof Response) {
            console.error(LOGERROR.INVALID_USER_ID.replace("{userId}", id)); 
            return idAvailable;
        }

        const user_id = params.user_id;
        if (user_id != id && params.user_type != 'A') {
            console.error(LOGERROR.NOT_ALLOWED_TO_UPDATE.replace("{userId}", id));  
            return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.NOT_ALLOWED);
        }

        const requestBody = await req.json();
        const updateUser: UserProfile = requestBody;

        console.log(LOGINFO.FETCHING_USER_PROFILE.replace("{userId}", id));  

        const { data: user, error: userError } = await getUserProfile(id);

        if (userError) {
            console.error(LOGERROR.USER_PROFILE_FETCH_ERROR.replace("{userId}", id), userError); 
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} : ${userError}`);
        }

        if (!user) {
            console.log(LOGINFO.USER_NOT_FOUND.replace("{userId}", id));  
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND_);
        }

        
        if (params.user_type != 'A') {
            if (requestBody.user_type != user.user_type) {
                console.error(LOGERROR.USER_NOT_ALLOWED_TO_CHANGE.replace("{userType}", user.user_type)); 
                return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, `${USERMODULE.USER_NOT_ALLOWED_TO_CHANGE} 'user type' ${user.user_type} to ${requestBody.user_type}`);
            }
            if (requestBody.account_status != user.account_status) {
                console.error(LOGERROR.USER_NOT_ALLOWED_TO_CHANGE.replace("{accountStatus}", user.account_status));  
                return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, `${USERMODULE.USER_NOT_ALLOWED_TO_CHANGE} 'account status' ${user.account_status} to ${requestBody.account_status}`);
            }
            if (requestBody.rank != user.rank) {
                console.error(LOGERROR.USER_NOT_ALLOWED_TO_CHANGE.replace("{rank}", user.rank));  
                return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, `${USERMODULE.USER_NOT_ALLOWED_TO_CHANGE} 'rank' ${user.rank} to ${requestBody.rank}`);
            }
        }

        updateUser.updated_at = new Date().toISOString();

        console.log(LOGINFO.UPDATING_PROFILE.replace("{userId}", id));  

        const { data, error: updateError } = await updateProfile(updateUser, id);
        if (updateError) {
            console.error(LOGERROR.PROFILE_UPDATE_ERROR.replace("{userId}", id), updateError.message); 
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} : ${updateError.message}`);
        }

        if (!data) {
            console.log(LOGINFO.USER_NOT_FOUND.replace("{userId}", id));  
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND);
        }

        console.log(LOGINFO.PROFILE_UPDATED_SUCCESS.replace("{userId}", id));  // Log successful profile update

        return SuccessResponse(USERMODULE.USER_UPDATE_SUCCESS, HTTP_STATUS_CODE.OK);
        
    } catch (error) {
        console.error(LOGERROR.INTERNAL_SERVER_ERROR, error);  // Log internal server errors
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
