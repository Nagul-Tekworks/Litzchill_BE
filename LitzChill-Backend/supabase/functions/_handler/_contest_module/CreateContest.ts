
import { ContestModel } from "../../_model/ContestModel.ts";
import { createContest } from "../../_repository/_contest_repo/ContestRepository.ts";
import  {ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestDetails } from "../../_shared/_validation/ContestDetailsValidation.ts";

/**
 * Handles the creation of a new contest by validating the provided contest details 
 * and storing the data in the database.
 *
 * @param {Request} req - The HTTP request object containing the contest details in the body.
 * @param {Record<string, string>} params - Additional URL parameters (User details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 *
 */
export async function handleCreateContext(req: Request,params:Record<string,string>): Promise<Response> {
     try {

          console.info(`INFO: Request Recieved in create contest `);
          const contestData: ContestModel = await req.json();
          
          // Validating contest all details
          const validationErrors = validateContestDetails(contestData);
          if (validationErrors instanceof Response) {
                console.error(`ERROR: Contest Validation Failed: `,validationErrors);
                return validationErrors;
          }

          contestData.created_at = new Date().toISOString();
          contestData.status = contestData.status?.toLocaleLowerCase();

          //calling supabase query for creating contest
          const { data, error } = await createContest(contestData);

          //if data not inserted then returning error response
          if (!data || data.length === 0 || error) {
               console.error(`ERROR: Contest not created.due to some database error or query error, ${error?.message}`);
               return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     `${COMMON_ERROR_MESSAGES.DATABASE_ERROR} ${error?.message}`,
               )

          }

          // Returning success response with created contest data
          console.info(`INFO: Returning success response with created contest data ` , data);
          return SuccessResponse(
               CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_CREATED, 
                HTTP_STATUS_CODE.CREATED,
               
          );

     }
     catch (error) {
          // handling internal errors
          console.error(`ERROR: Internal Server Error during creating new contest,${error}`);
          return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`,
          );
     }
}
