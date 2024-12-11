// deno-lint-ignore-file
import update_contest_entry_status, { getContest } from "../../_repository/_contestEntry_repo/patchContestRepo.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE, CONETST_ENTRY_SUCCESS_MESSAGE } from "../../_shared/_messages/ContestEntryMsgs.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateRequiredFieldsForPatch } from "../../_shared/_validation/ContestEntryValidation.ts";


//The update_Contest_entry function is an API handler that ensures only authorized admin users can 
//update the status of a specific contest entry. It validates the input, checks if the entry exists, 
//and then performs the update operation in the database. The function provides structured responses 
//for success and error scenarios, maintaining robust error handling and clear communication of issues.

export default async function update_Contest_entry(req: Request,param:Record<string, string>) {
  try {
    const { contest_id, entry_id, new_status } = await req.json();

    // Validate input
    const fields = validateRequiredFieldsForPatch(contest_id,entry_id,new_status);
        if (fields instanceof Response) {
            return fields;
        }

      const checkStatus:string[]=["Active","Disqualified"]
      if(!checkStatus.includes(new_status))
      {
        return ErrorResponse(
          HTTP_STATUS_CODE.BAD_REQUEST,
          CONETST_ENTRY_ERROR_MESSAGE.INVALID_STATUS)
      }

    // Fetch existing contest entry
    const {fetchedData,errorinfetching} = await getContest(contest_id, entry_id);
      if(errorinfetching){
        return ErrorResponse(
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
          COMMON_ERROR_MESSAGES.DATABASE_ERROR
          
        )
      }
    if (!fetchedData || fetchedData.length==0) {
      return ErrorResponse(
        HTTP_STATUS_CODE.CONFLICT,
        CONETST_ENTRY_ERROR_MESSAGE.NOT_FOUND,
      );
    }

    // Update the status
    const {updatedData,errorinupdate} = await update_contest_entry_status(contest_id, entry_id, new_status);
    if(errorinupdate){
      return ErrorResponse(
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        COMMON_ERROR_MESSAGES.DATABASE_ERROR
      )
    }
    return SuccessResponse(
      CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_UPDATE,
      updatedData,
      HTTP_STATUS_CODE.OK
    );

  } catch (error) {
    return ErrorResponse(
       HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
}
