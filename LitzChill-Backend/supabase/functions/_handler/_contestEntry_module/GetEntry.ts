// deno-lint-ignore-file
import {ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import getContestById from "../../_repository/_contestEntry_repo/ContestEntryRepository.ts";
import { CONETST_ENTRY_ERROR_MESSAGE, CONETST_ENTRY_SUCCESS_MESSAGE } from "../../_shared/_messages/ContestEntryMsgs.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestId } from "../../_shared/_validation/ContestEntryValidation.ts";
 

//This Deno TypeScript function, get_Contest_Data, is an asynchronous handler that retrieves 
//contest data based on a given contest ID. It validates the input, fetches data from a 
//repository, and returns an appropriate HTTP response.


export default async function get_Contest_Data(req: Request,param:Record<string, string>) {
  try {
     //checking user role
        const contestId=param.id;
        
        const validatedId=validateContestId(contestId);
        if(validatedId instanceof Response){
            return validatedId;
        }
   
    const {data,error} = await getContestById(contestId);
    if(error){
      return ErrorResponse(
        HTTP_STATUS_CODE.BAD_REQUEST,
        COMMON_ERROR_MESSAGES.DATABASE_ERROR
      )
    }

    if (!data || data.length==0) {
     
      return ErrorResponse(
         HTTP_STATUS_CODE.BAD_REQUEST,
        CONETST_ENTRY_ERROR_MESSAGE.INVALID_CONTEST,
      );
    }
    return SuccessResponse(
      CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_GET,
      data,
      HTTP_STATUS_CODE.OK
    );
    
  } catch (error) {
    return ErrorResponse(
    HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    );
    
  }
}
