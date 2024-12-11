import { getContestDetailsById } from "../../_repository/_contest_repo/ContestRepository.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { CONTEST_MODULE_ERROR_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestId } from "../../_shared/_validation/ContestDetailsValidation.ts";

//Getting Contest Details By Id 
export async function handlegetContestById(req:Request,params:Record<string,string>):Promise<Response> {

    try {
        //getting id from 
        const contest_id=params.id;
        console.log(`INFO: Received request to get contest with ID: ${contest_id}`);

        //validating contest id.
        const validationErrors=validateContestId(contest_id);
        if(validationErrors instanceof Response){
            console.error(`ERROR: Contest Id Validation Failed: `,validationErrors);
             return validationErrors;
        }
        
        //calling repository function to get contest details.
        const {contestData,error}=await getContestDetailsById(contest_id);
        
        //returnig error message if any database error occured.
        if(error){
            console.error(`ERROR: Database Error during getting contest data,${error.message}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${error.message}`
            );
        }

        //returning not contest found error.
        if(!contestData||contestData.length==0){
            console.error(`ERROR: No contest found for ID: ${contest_id}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED 
            )
        }

        
        //returning success Response
        console.log(`INFO: Returning contest details : `,contestData);
        return SuccessResponse(
              CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_DETAILS_FETCHED,
              contestData
        );


    } catch (error) {
        console.error(`ERROR: Internal Server Error during getting contest data by id,${error}`);
        //handling any Internal Server Error
        return ErrorResponse(
             HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
      )
    }
}