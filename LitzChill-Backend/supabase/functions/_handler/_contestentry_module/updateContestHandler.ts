import update_contest_entry_status, {getContestEntry } from "../../_repository/_contestentry_repo/updateContestRepo.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE, CONETST_ENTRY_SUCCESS_MESSAGE } from "../../_shared/_messages/ContestEntryMsgs.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateRequiredFieldsForPatch } from "../../_shared/_validation/ContestEntryValidation.ts";
/**
 * Updates the status of a contest entry after validating input and conditions.
 * 
 * Functionality:
 * 1. Validates the required fields: `contest_id`, `entry_id`, and `new_status`.
 * 2. Ensures the new status is either "Active" or "Disqualified".
 * 3. Fetches the existing contest entry to confirm its presence.
 * 4. If the entry exists, updates its status in the database.
 * 5. Returns success response upon successful update or an appropriate error response otherwise.
 * 
 * @param req - Request object containing JSON data for `contest_id`, `entry_id`, and `new_status`.
 * @param param - Additional parameters for the request (currently unused).
 * @returns - A response object indicating the result of the operation.
 */
export default async function update_Contest_entry(req: Request,_param: Record<string, string>): Promise<Response>{
  try {
    const { contest_id, entry_id, new_status } = await req.json();

    // Validate input
    const fields = validateRequiredFieldsForPatch(contest_id,entry_id,new_status);
        if (fields instanceof Response) {
            return fields;
        }

      const checkStatus:string[]=["Active","Disqualified"]
      if(!checkStatus.includes(new_status)){
      return ErrorResponse( HTTP_STATUS_CODE.BAD_REQUEST,CONETST_ENTRY_ERROR_MESSAGE.INVALID_STATUS);
      }
/**
 * Fetches contest entry details based on contest ID and entry ID.
 * Handles the following:
 * 1. If an error occurs during the fetch, returns an error response with a database error message.
 * 2. If no contest entry is found, returns a conflict error response indicating the entry is not found.
 */
  const {fetchedData,errorInFetching} = await getContestEntry(contest_id, entry_id);
      if(errorInFetching){
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.DATABASE_ERROR);
      }
    if (!fetchedData || fetchedData.length==0) {
      return ErrorResponse(HTTP_STATUS_CODE.CONFLICT,CONETST_ENTRY_ERROR_MESSAGE.NOT_FOUND);
    }

    /**
 * Updates the status of a contest entry based on contest ID and entry ID.
 * Handles the following:
 * 1. If an error occurs during the update, returns an error response with a database error message.
 * 2. If the update is successful, returns a success response with the updated data.
 */
  const {updatedData,errorinupdate} = await update_contest_entry_status(contest_id, entry_id, new_status);
    if(errorinupdate){
      
      return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.DATABASE_ERROR)
     }
    return SuccessResponse(
      HTTP_STATUS_CODE.OK,CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_UPDATE,updatedData);
    } catch (_error) {
    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}
