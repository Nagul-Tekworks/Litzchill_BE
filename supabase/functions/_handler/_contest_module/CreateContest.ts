
import { ContestModel } from "../../_model/ContestModel.ts";
import { createContest } from "../../_repository/_contest_repo/ContestRepository.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/SuccessMessages.ts";
import { validateContestDetails } from "../../_shared/_validation/ValidateContestDetails.ts";

//Checking user privilleges, Validation contest details and finally creating new Contest
export async function handleCreateContext(req: Request,user:Record<string,string>): Promise<Response> {
     try {

          console.log("User id is: ",user.user_id);
          const contestData: ContestModel = await req.json();


          // Validating the contest details
          const validationErrors = validateContestDetails(contestData);
          if (validationErrors instanceof Response) {
                return validationErrors;
          }

          contestData.created_at = new Date().toISOString();
          contestData.status = contestData.status?.toLocaleLowerCase();

          //calling supabase query for creating contest
          const { insertedData, error } = await createContest(contestData);

          //if data not inserted then returning error response
          if (!insertedData || insertedData.length === 0 || error) {
               console.log("Error: Contest not created.due to some database errro or query error", error);
               return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     `${COMMON_ERROR_MESSAGES.DATABASE_ERROR} ${error?.message}`,
               )

          }

          // Returning success response with created contest data
          console.log("Returning success response with created contest data", insertedData);
          return SuccessResponse(
                CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_CREATED,
                insertedData,
                HTTP_STATUS_CODE.CREATED,
          );

     }
     catch (error) {
          // handling internal errors
          console.error("Internal server error in create contest", error);
          return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`,
          );
     }
}
