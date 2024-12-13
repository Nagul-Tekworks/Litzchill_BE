import  {ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestId } from "../../_shared/_validation/ContestDetailsValidation.ts";
import { deleteContestById } from "../../_repository/_contest_repo/ContestRepository.ts";
import { CONTEST_MODULE_ERROR_MESSAGES, CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";

/**
 * Handles the deletion of a existing contest by validating the contest id.
 * -Performing soft deletion just updating the contest status to deleted.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Record<string, string>} params - Additional URL parameters contains(ContestId, User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 * 
 */

export async function handleDeleteContest(req: Request, params: Record<string, string>): Promise<Response> {
    try {
        const contest_id=params.id;
        console.log(`INFOR: Received request to delete contest with ID: ${contest_id}`);

        //validation contest Id.
        const validationErrors=validateContestId(contest_id);
        if(validationErrors instanceof Response){
            console.error(`ERROR: Contest Id Validation Failed,`,validationErrors);
             return validationErrors;
        }

        const {deletedData,error}=await deleteContestById(contest_id);

        //returning database erorr.
        if(error){
            console.error(`ERROR: Database error during deleting contest data,${error.message}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${error.message}`
            )
        }

        //returning not found response
        if(!deletedData||deletedData.length==0){
            console.error(`ERROR: Contest not found or already deleted.`);
            return ErrorResponse(
                HTTP_STATUS_CODE.NOT_FOUND,
                CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED
            )
        }

        //returning success response.
        console.log("INFO: Contest Has Been Deleted Succesfully");
        return SuccessResponse(
             CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_DELETED
        )

    } catch (error) {
        //handling any Internal Server Error
        console.error(`ERROR: Internal Server Error during deleting contedt data,`,error);
        return ErrorResponse(
             HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
        )
    }
}