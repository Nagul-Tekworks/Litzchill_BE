import { updateUserStatus } from "../../_repository/_user_repo/UserRepository.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";
import { validateAccountStatus, validatingUserId } from "../../_shared/_validation/UserValidate.ts";
import { LOGERROR,LOGINFO } from "../../_shared/_messages/userModuleMessages.ts";
import Logger from "../../_shared/_logger/Logger.ts";
const logger=Logger.getInstance();
/**
 * This function is responsible for updating the account status of a user by admin 
 * 
 * @param req --request object contain JSON body
 * @param params --Params contain user_id, user_jwt, user account status, user_type
 * @returns --It will return coorresponding response(update success,error)
 */
export async function ActivateOrDeactivateUser(req: Request, params: Record<string, string>): Promise<Response> {
  try {
    const id = params.id;
    
    const body = await req.json();
    const { account_status } = body; 

    logger.log(LOGINFO.USER_STATUS_UPDATE_STARTED.replace("{user_id}", id).replace("{status}", account_status));  // Log when status update starts

    // Validating  account status
    const isvalidAccountStatus = await validateAccountStatus(account_status);
    if (isvalidAccountStatus instanceof Response) {
      logger.error(LOGERROR.INVALID_ACCOUNT_STATUS.replace("{status}", account_status)); 
      return isvalidAccountStatus;
    }

    // 
    const idavailble = await validatingUserId(id);
    if (idavailble instanceof Response) {
      logger.error(LOGERROR.INVALID_USER_ID.replace("{user_id}", id));  
      return idavailble;
    }

    
    if (params.user_type != 'A') {
      logger.error(LOGERROR.NOT_ALLOWED_TO_CHANGE_USER_STATUS.replace("{user_id}", id));  
      return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.NOT_ALLOWED);
    }

    logger.log(LOGINFO.USER_STATUS_UPDATE_PROCESS.replace("{user_id}", id)); 

    
    const { data, error: updateError } = await updateUserStatus(id, account_status);
    if (updateError) {
      logger.error(LOGERROR.INTERNAL_SERVER_ERROR.replace("{error}", updateError));  
      return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} : ${updateError.message}`);
    }

    if (!data) {
      logger.error(LOGERROR.USER_NOT_FOUND.replace("{user_id}", id));  
      return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND_);
    }

    logger.log(LOGINFO.USER_STATUS_UPDATED.replace("{user_id}", id).replace("{status}", account_status));  

    return SuccessResponse(`${USERMODULE.USER_STATUS_SET_TO_BE} :${account_status}`, HTTP_STATUS_CODE.OK);
  } catch (error) {
    logger.error(LOGERROR.INTERNAL_SERVER_ERROR+error); 
    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
  }
}
