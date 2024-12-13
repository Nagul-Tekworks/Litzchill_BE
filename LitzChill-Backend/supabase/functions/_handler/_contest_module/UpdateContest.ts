import { ContestModel } from "../../_model/ContestModel.ts";
import { getContestDetailsById, updateContestById } from "../../_repository/_contest_repo/ContestRepository.ts";
import  {ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONTEST_MODULE_ERROR_MESSAGES, CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestDetails, validateContestId } from "../../_shared/_validation/ContestDetailsValidation.ts";

/**
 * Handles the updation of a existing contest by validating the contest id and all provided contest details.
 *
 * @param {Request} req - The HTTP request object containing the contest details in the body.
 * @param {Record<string, string>} params - Additional URL parameters contains(ContestId, User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:.
 *
 */

export async function handleupdateContest(req:Request,params:Record<string,string>):Promise<Response> {

    try {
        const contest_id=params.id;
        
        console.log(`INFO: Received request to update contest with ID: ${contest_id}`);

        //validating contest_id

        const contestIdValidationErrors=validateContestId(contest_id);
        if(contestIdValidationErrors instanceof Response){
             console.error(`ERROR: Contest Id Validation Failed,${contestIdValidationErrors}`);
             return contestIdValidationErrors;
        }

    
        //getting contest data
        const {contestData,error}=await getContestDetailsById(contest_id);
        if(error){
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${error.message}`
           )
        }
        if(!contestData){
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED 
           )
        }
        const contestDetails:Partial<ContestModel>=await req.json();
        console.log("GEtted Data is: ",contestData);

        const start_date=new Date(contestData.start_date).toISOString();
        const end_date=new Date(contestData.end_date).toISOString();
        if(!contestDetails.start_date){
            contestDetails.start_date=start_date
        }
        else if(!contestDetails.end_date){
            contestDetails.end_date=end_date
        }
        else{
            contestDetails.start_date=start_date
            contestDetails.end_date=end_date
        }
        console.log('INFO: Start_date: ',start_date);
        console.log('INFO: ENd_date: ',end_date);

        //validating contest details
        const validationErrors=validateContestDetails(contestDetails,true);

        if(validationErrors instanceof Response){
            console.error(`ERROR: Contest Validation Failed: ,${validationErrors}`);
             return validationErrors;
        }
        contestDetails.updated_at=new Date().toISOString();
        contestDetails.contest_id = contest_id;


        //calling repository function to update contest details
        const {updatedContest,updateError}=await updateContestById(contestDetails);

        if(updateError){
            console.error(`ERROR: Database Error during updating contest data,${error}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${updateError.message}`
            )
        }

        if(!updatedContest||updatedContest.length==0){
            console.error(`ERROR: No contest found for ID: ${contest_id}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED 
            )
        }

        //returning success response
        console.log(`INFO: Contest Has Been Updated Successfully:  ${updatedContest}`);
        return SuccessResponse(
            CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_UPDATED
        )
        
    } catch (error) {
        console.error(`ERROR: Internal Server Error during updating contest,${error}`);
        //handling any Internal Server Error
        return ErrorResponse(
              HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
      )
    }
    
}