import { getUserProfile } from "../../_repository/_user_repo/UserRepository.ts";
import ErrorResponse from "../../_responses/Response.ts";
import { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";
import { validatingUserId } from "../../_shared/_validation/UserValidate.ts";
import { LOGERROR,LOGINFO } from "../../_shared/_messages/userModuleMessages.ts";

/**
 * This method can fetch user profile by id
 * @param req --It is the request Object
 * @param params --Params contain user_id, user_jwt, user account status, user_type
 * @returns --It will return a JSON response that contains the user profile
 */
export default async function FetchUserProfile(_req: Request, params: Record<string, string>): Promise<Response> {
    try {
        const user_Id = params.id;

        console.log(LOGINFO.FETCH_PROFILE_STARTED.replace("{userId}", user_Id)); 

        const idAvailable = await validatingUserId(user_Id);
        if (idAvailable instanceof Response) {
            console.error(LOGERROR.INVALID_USER_ID.replace("{userId}", user_Id));
            return idAvailable;
        }

        console.log(LOGINFO.FETCH_PROFILE_VALIDATED.replace("{userId}", user_Id)); 

        const { data: userData, error: userError } = await getUserProfile(user_Id);
        if (userError) {
            console.error(LOGERROR.USER_PROFILE_FETCH_ERROR.replace("{userId}", user_Id), userError); 
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR}, ${userError.message}`);
        }

        if (!userData) {
            console.log(LOGINFO.USER_NOT_FOUND.replace("{userId}", user_Id)); 
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND);
        }

        console.log(LOGINFO.USER_PROFILE_FETCHED.replace("{userId}", user_Id)); 

        return SuccessResponse(USERMODULE.USER_DETAILS, HTTP_STATUS_CODE.OK, userData);

    } catch (error) {
        console.error(LOGERROR.INTERNAL_SERVER_ERROR, error);  
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
