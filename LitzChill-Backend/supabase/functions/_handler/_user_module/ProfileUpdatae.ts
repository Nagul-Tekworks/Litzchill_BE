import { UserProfile } from "../../_model/UserModel.ts";
import { updateProfile } from "../../_repository/_user_repo/UserRepository.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";


export default async function updateUserProfile(req: Request,params: Record<string, string>): Promise<Response> {  // Ensure the return type is always Response
    try {


        //
        const id=params.id;
        const user_id = params.user_id;
        const requestBody = await req.json();
        const updateUser: UserProfile = requestBody;

        const userRoles:string[]=['U','M','V'];
        if(userRoles.includes(params.user_type)){
            if(requestBody.user_type||requestBody.account_status||requestBody.rank){
                return ErrorResponse(
                    HTTP_STATUS_CODE.FORBIDDEN,
                    USERMODULE.PERMISSION_DENIED
                )
            }
        }
       if(user_id!=id&&params.user_type!='A')
       {
            return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN,USERMODULE.NOT_ALLOWED)
       }
        updateUser.updated_at = new Date().toISOString();
        console.log("start");

        const data = await updateProfile(updateUser, id);

        if (data instanceof Response) {
            return data
            
        } else {
            // Return a failure response if no data was returned (e.g., user not found)
            return SuccessResponse(USERMODULE.USER_UPDATE_SUCCESS);
        }
    } catch (err) {
        console.error(err);
        // Always return a Response, even in case of an error
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)
    }
}
