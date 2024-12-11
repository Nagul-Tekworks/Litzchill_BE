
import { getUserProfile } from "../../_repository/_user_repo/UserRepository.ts";

import ErrorResponse from "../../_responses/Response.ts";
import { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";


export default async function FetchUserProfile(req: Request,params:Record<string, string>):Promise<Response> {
  
    try {
      
      const user_Id=params.id;
      

     const {userData,userError}=await getUserProfile(user_Id)
     if(userError){
      return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${USERMODULE.INTERNAL_SERVER_ERROR}, ${userError.message}`);
     }
     if(!userData||userData.length==0){
      return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,USERMODULE.USER_NOT_FOUND,)
     }
      console.log("UserData is: ",userData)
     return SuccessResponse(USERMODULE.USER_DETAILS,userData)



    } catch (error) {
      
     return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR,)
    }
 
 
}
