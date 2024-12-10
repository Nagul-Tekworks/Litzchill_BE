import { ContestModel } from "../../_model/ContestModel.ts";
import { updateContestById } from "../../_repository/_contest_repo/ContestRepository.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONTEST_MODULE_ERROR_MESSAGES, CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestDetails, validateContestId } from "../../_shared/_validation/ContestDetailsValidation.ts";

//updating contest details
export async function handleupdateContest(req:Request,params:Record<string,string>):Promise<Response> {

    try {
        const contest_id=params.id;
        console.log(`Received request to get contest with ID: ${contest_id}`);

        //validating contest_id
        const contestIdValidationErrors=validateContestId(contest_id);
        if(contestIdValidationErrors instanceof Response){
             console.log("Error: Contest Id Validation Failed",contestIdValidationErrors);
             return contestIdValidationErrors;
        }

        const contestDetails:Partial<ContestModel>=await req.json();

        //validating contest details
        const validationErrors=validateContestDetails(contestDetails,true);

        if(validationErrors instanceof Response){
            console.log("Error: Contest Validation Failed: ",validationErrors);
             return validationErrors;
        }
        contestDetails.updated_at=new Date().toISOString();
        contestDetails.contest_id = contest_id;

        //calling repository function to update contest details
        const {updatedContest,error}=await updateContestById(contestDetails);

        if(error){
            console.log("Error: Database Error during getting contest data",error);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${error.message}`
            )
        }

        if(!updatedContest||updatedContest.length==0){
            console.error(`Error: No contest found for ID: ${contest_id}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED 
            )
        }

        //returning success response
        console.log("Contest Has Been Updated Successfully");
        return SuccessResponse(
            CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_UPDATED
        )
        
    } catch (error) {
        console.log("Error: Internal Server Error",error);
        //handling any Internal Server Error
        return ErrorResponse(
              HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
      )
    }
    
}