


import { DeactivateUser } from "../../_repository/_user_repo/UserRepository.ts";
import ErrorResponse from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";



export async function DeactivateAccount(req:Request,params:Record<string,string>) : Promise<Response>
{
  const id=params.id;

  if(id!=params.user_id&&params.user_type!='A')
  {
    return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN,USERMODULE.NOT_ALLOWED)
  }

  console.log("start of deactivate");
   try
   {

    const data=await DeactivateUser(id);    
        return data;
       
   }
   catch(error)
   {
    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)
   }
    
    
}
    