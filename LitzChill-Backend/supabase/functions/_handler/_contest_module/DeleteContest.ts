
import  {ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { validateContestId } from "@shared/_validation/ContestDetailsValidation.ts";
import { deleteContestById } from "@repository/_contest_repo/ContestRepository.ts";
import { CONTEST_MODULE_ERROR_MESSAGES, CONTEST_MODULE_SUCCESS_MESSAGES } from "@shared/_messages/ContestModuleMessages.ts";
import { Logger } from "@shared/_logger/Logger.ts";

/**
 * Handles the deletion of a existing contest by validating the contest id.
 * -Performing soft deletion just updating the contest status to deleted.
 *
 * @param {Request}_req - The HTTP request object.
 * @param {Record<string, string>} params - Additional URL parameters contains(ContestId, User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 * 
 */

export async function handleDeleteContest(_req: Request, params: Record<string, string>): Promise<Response> {
    const logger=Logger.getloggerInstance();
    try {

        const contest_id=params.id;

        logger.info(`request received to delete contest with ID: ${contest_id}`);

        //validation contest Id.
        const validationErrors=validateContestId(contest_id);
        if(validationErrors instanceof Response){
            logger.error(`contest Id Validation Failed, ${validationErrors}`);
             return validationErrors;
        }

        //calling repository function to delete contest.
        logger.info(`calling repository function to delete contest by id ${contest_id}`);
        const {data,error}=await deleteContestById(contest_id);

        //returning database erorr if query return any error.
        if(error){
            logger.error(`database error during deleting contest data,${error.message}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR}, ${error.message}`
            )
        }

        //returning not found response
        if(!data||data.length==0){
            logger.error(`contest not found or already deleted. with contest id ${contest_id}`);
            return ErrorResponse(
                HTTP_STATUS_CODE.NOT_FOUND,
                CONTEST_MODULE_ERROR_MESSAGES.CONTEST_NOT_FOUND_OR_DELETED
            )
        }

        //returning success response.
        logger.info("Contest Has Been Deleted Succesfully");
        return SuccessResponse(
             CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_DELETED,
             HTTP_STATUS_CODE.OK
        )

    } catch (error) {
        //handling any Internal Server Error
        logger.error(`ERROR: Internal Server Error during deleting contedt data,${error}`);
        return ErrorResponse(
             HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
        )
    }
}