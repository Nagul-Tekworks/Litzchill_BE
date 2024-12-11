
import { ContestModel } from "../../_model/ContestModel.ts";
import { createContest } from "../../_repository/_contest_repo/ContestRepository.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestDetails } from "../../_shared/_validation/ContestDetailsValidation.ts";


//Validating contest details and creating new Contest
export async function handleCreateContext(req: Request,params:Record<string,string>): Promise<Response> {
     try {

          console.log(`INFO: Request Recieved in create contest `);
          const contestData: ContestModel = await req.json();
          
          // Validating the contest details
          const validationErrors = validateContestDetails(contestData);
          if (validationErrors instanceof Response) {
                console.error(`ERROR: Contest Validation Failed: `,validationErrors);
                return validationErrors;
          }

          contestData.created_at = new Date().toISOString();
          contestData.status = contestData.status?.toLocaleLowerCase();

          //calling supabase query for creating contest
          const { insertedData, error } = await createContest(contestData);

          //if data not inserted then returning error response
          if (!insertedData || insertedData.length === 0 || error) {
               console.error(`ERROR: Contest not created.due to some database error or query error, ${error?.message}`);
               return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     `${COMMON_ERROR_MESSAGES.DATABASE_ERROR} ${error?.message}`,
               )

          }

          // Returning success response with created contest data
          console.log(`INFO: Returning success response with created contest data ` , insertedData);
          return SuccessResponse(
                CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_CREATED,
               '',
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
