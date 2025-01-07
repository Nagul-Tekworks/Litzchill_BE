
import { ContestModel } from "@model/ContestModel.ts";
import { createContest } from "@repository/_contest_repo/ContestRepository.ts";
import  {ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { Logger } from "@shared/_logger/Logger.ts";
import { CONTEST_MODULE_SUCCESS_MESSAGES } from "@shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";  
import { validateContestDetails } from "@shared/_validation/ContestDetailsValidation.ts";


/**
 * Handles the creation of a new contest by validating the provided contest details 
 * and storing the data in the database.
 *
 * @param {Request} req - The HTTP request object containing the contest details in the body.
 * @param {Record<string, string>} params - Additional URL parameters (User details).
 * @returns {Promise<Response>} - A response indicating success or failure: success code-201, failure code like 400,404,500
 *
 */
export async function handleCreateContext(req: Request,_params:Record<string,string>): Promise<Response> {
     const logger=Logger.getloggerInstance();

      try {
          logger.info(`Request Recieved in create contest`);

          const contestData: ContestModel = await req.json();
          logger.info(`Successfully parsed json body ${contestData}`);


         // Validating contest all details
          logger.info(`calling validation function to validate contest details`);
          const validationErrors = validateContestDetails(contestData);
          if (validationErrors instanceof Response) {
                logger.error(`contest Validation Failed: ${validationErrors}`);
                return validationErrors;
          }

          logger.info(`Initializing created_at date with current date.`);
          contestData.created_at = new Date().toISOString();


          //calling supabase query for creating contest
          logger.info(`Calling Repository function to create contest with contest data ${contestData}`)
          const { data, error } = await createContest(contestData);

          if(error){
               logger.error(`Contest not created, due to some database error or query error, ${error?.message}`);
               return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     `${COMMON_ERROR_MESSAGES.DATABASE_ERROR} ${error?.message}`,
               )

          }

          //if data not inserted then returning error response
          if (!data || data.length === 0) {
               logger.error(`Contest not created, due to some Reason`);
               return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
               )

          }

          // Returning success response with created contest data
          logger.info(`Returning success response with created contest message.`);
          return SuccessResponse(
               CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_CREATED, 
                HTTP_STATUS_CODE.CREATED,
               
          );

     }
     catch (error) {
          // handling internal errors
          logger.error(`ERROR: Internal Server Error during creating new contest,${error}`);
          return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`,
          );
     }
}
