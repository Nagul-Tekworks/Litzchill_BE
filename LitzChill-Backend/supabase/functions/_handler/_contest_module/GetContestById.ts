import { getContestDetailsById } from "../../_repository/_contest_repo/ContestRepository.ts";
import  {ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { Logger } from "../../_shared/_logger/Logger.ts";
import { CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { CONTEST_MODULE_ERROR_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestId } from "../../_shared/_validation/ContestDetailsValidation.ts";

/**
 * Handles the getting of a existing contest by validating the contest id.

 * @param {Request} req - The HTTP request object..
 * @param {Record<string, string>} params - Additional URL parameters contains(Contest Id and User Details).
 * @returns {Promise<Response>} - A response indicating success or failure.
 *
 * - SUCCESS: Returns a 200 OK response with contest data and  success message .
 * - FAILURE:  due to validation or database issues, returns an appropriate error response.
 */
export async function handlegetContestById(_req:Request,params:Record<string,string>):Promise<Response> {

    const logger=Logger.getloggerInstance();
    try {
        //getting contest id from params
        const contest_id=params.id;
        logger.info(`Received request to get contest with ID: ${contest_id}`);


        //validating contest id.
        const validationErrors=validateContestId(contest_id);
        if(validationErrors instanceof Response){
            logger.error(`contest Id Validation Failed: ${validationErrors}`,);
             return validationErrors;
        }
    
        //calling repository function to get contest details.
        logger.info(`calling repository function to get contest data based on id ${contest_id}`)
        const {data,error}=await getContestDetailsById(contest_id);
        
        //returnig error message if any database error occured.
        if(error){
            logger.error(`database Error during getting contest data,${error.message}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${error.message}`
            );
        }

        //returning not contest found error.
        if(!data){
            logger.error(`No contest found for contest_Id: ${contest_id}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED 
            )
        }

        
        //returning success Response
        logger.info(`returning contest details : ${data}`);
        return SuccessResponse(
              CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_DETAILS_FETCHED,
              HTTP_STATUS_CODE.OK,
              data
        );


    } catch (error) {
        logger.error(`internal Server Error during getting contest data by id,${error}`);
        //handling any Internal Server Error
        return ErrorResponse(
             HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
      )
    }
}