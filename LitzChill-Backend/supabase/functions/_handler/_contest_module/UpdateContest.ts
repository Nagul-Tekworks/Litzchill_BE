import { ContestModel } from "@model/ContestModel.ts";
import { getContestDetailsById, updateContestById } from "@repository/_contest_repo/ContestRepository.ts";
import  {ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { Logger } from "@shared/_logger/Logger.ts";
import { CONTEST_MODULE_ERROR_MESSAGES, CONTEST_MODULE_SUCCESS_MESSAGES } from "@shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { validateContestDetails, validateContestId } from "@shared/_validation/ContestDetailsValidation.ts";

/**
 * Handles the updation of a existing contest by validating the contest id and all provided contest details.
 *
 * @param {Request} req - The HTTP request object containing the contest details in the body.
 * @param {Record<string, string>} params - Additional URL parameters contains(ContestId, User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:.
 *
 */

export async function handleupdateContest(req:Request,params:Record<string,string>):Promise<Response> {

    const logger=Logger.getloggerInstance();

    try {
        //getting contest id from params object.
        const contest_id=params.id;
        
        logger.info(`received request to update contest with ID: ${contest_id}`);

        //validating contest_id

        const contestIdValidationErrors=validateContestId(contest_id);
        if(contestIdValidationErrors instanceof Response){
            logger.error(`contest Id Validation Failed,${contestIdValidationErrors}`);
             return contestIdValidationErrors;
        }

    
        //getting contest data from repository
        logger.info(`calling Repository function to get the contest details by contest_id ${contest_id}`);
        const {data,error}=await getContestDetailsById(contest_id);

        if(error){
            logger.error(`database error coming during fetching contest ${error.message}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${error.message}`
           )
        }
        if(!data||data.length==0){
            logger.error(`no contest found with contest id ,${contest_id}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.NOT_FOUND,
                 CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED 
           )
        }

        logger.info('Parsing json body');
        const contestDetails:Partial<ContestModel>=await req.json();

        //getting dates from contestObject
        logger.info(`Getting start date and end date from contest object and assinging into user provide object.`);
        const start_date=new Date(data.start_date).toISOString();
        const end_date=new Date(data.end_date).toISOString();
        
        if(!contestDetails.start_date){
            contestDetails.start_date=start_date
        }
        if(!contestDetails.end_date){
            contestDetails.end_date=end_date
        }
        
       
       

        //validating contest details
        logger.info(`calling validation function to validate contest details`);
        const validationErrors=validateContestDetails(contestDetails,true);

        if(validationErrors instanceof Response){
            logger.error(`contest Validation Failed: ,${validationErrors}`);
             return validationErrors;
        }
        logger.info(`Assigning update date and contest id to contestDetails Object.`);
        contestDetails.updated_at=new Date().toISOString();
        contestDetails.contest_id = contest_id;


        //calling repository function to update contest details
        logger.info(`calling repository function to update contest details with ${contestDetails}`);
        const {data :updatedContest,error:updateError}=await updateContestById(contestDetails);

        if(updateError){
            logger.error(`database Error during updating contest data, ${error}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${updateError.message}`
            )
        }

        if(!updatedContest||updatedContest.length==0){
            logger.error(`no contest found for contest Id: ${contest_id}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED 
            )
        }

        //returning success response
        logger.info(`contest Has Been Updated Successfully:  ${updatedContest}`);
        return SuccessResponse(
            CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_UPDATED,
            HTTP_STATUS_CODE.OK
        )
        
    } catch (error) {
        logger.error(`internal Server Error during updating contest,${error}`);
        //handling any Internal Server Error
        return ErrorResponse(
              HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
      )
    }
    
}