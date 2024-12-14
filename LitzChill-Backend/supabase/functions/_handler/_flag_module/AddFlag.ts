import { FlagModel } from "../../_model/FlagModel.ts";
import { checkMemeId } from "../../_repository/_comment_repo/CommentRepository.ts";
import { addFlagToMeme, checkUserAlreadyFlag, updateFlagCount } from "../../_repository/_flag_repo/FlagRepository.ts";
import  {ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMENT_MODULE_ERROR_MESSAGES } from "../../_shared/_messages/CommentModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { FLAG_ERROR_MESSAGES, FLAG_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/FLagModuleMessags.ts";
import { validateFlagDetails } from "../../_shared/_validation/FlagDetailsValidation.ts";

/**
 * Handles the adding flag to existing meme by validating contentType and ContentId
 * 
 * @param {Request} req - The HTTP request object ontaining the flag details in the body.
 * @param {Record<string, string>} params - Additional URL parameters contains(User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 *
 * - SUCCESS: Returns a 200 OK response with add flag success message .
 * - FAILURE: On failure due to validation or database issues, returns an appropriate error response.
 */

export async function handleAddFlagRequest(req: Request, params: Record<string, string>): Promise<Response> {
    try {

        // Parsing the request body to get flag details
        const flagData: FlagModel = await req.json();

        console.info("INFO: Request Recieved With Flag details", flagData);


        // Validating the flag details
        const validationErrors = validateFlagDetails(flagData);
        if (validationErrors instanceof Response) {
            console.error("ERROR: Flag Validation Failed: ", validationErrors);
            return validationErrors;
        }


        flagData.user_id = params.user_id;

        // Checking if the meme (content) exists
        console.info("INFO: Getting Meme Details By Meme Id", flagData.contentId);
        const { data:memeData, error:memeError } = await checkMemeId(flagData.contentId);
        if (memeError) {
            console.error("ERROR: While Getting Meme Details By Meme Id");
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${memeError.message}`
            )
        }

        if (!memeData || memeData.length == 0) {
            console.error("ERROR: No Meme Found With Provided Meme Id");
            return ErrorResponse(
                HTTP_STATUS_CODE.NOT_FOUND,
                COMMENT_MODULE_ERROR_MESSAGES.CONTENT_NOT_FOUND,

            );
        }

        // Checking if the user has already flagged this meme
        console.info('INFO: Checking If User Already Added Flag to this meme');
        const { data: userflagData, error:flagerror } = await checkUserAlreadyFlag(flagData.user_id, memeData[0].meme_id);

        if (flagerror) {
            console.error("ERROR: While Chekcing  User Already flag to meme");
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${flagerror.message}`
            )
        }
        if (userflagData && userflagData.length > 0) {
            console.error("ERROR: User has already flagged this meme");
            return ErrorResponse(
                HTTP_STATUS_CODE.CONFLICT,
                FLAG_ERROR_MESSAGES.USER_ALREADY_ADDED_FLAG,

            );
        }

        flagData.created_at = new Date();

        // Adding the flag to the meme
        console.info('INFO: Adding Alag to meme');
        const { data: addedFlag, error: addFlagError } = await addFlagToMeme(flagData);

        if (addFlagError) {
            console.error("ERROR: Database Error While Adding Flag To Meme");
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${addFlagError.message}`
            )
        }
        if (!addedFlag) {
            console.error("ERROR: While Adding Flag To Meme");
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                FLAG_ERROR_MESSAGES.FLAG_ERROR_DURING_ADDING,

            );
        }

        //updating flag count
        console.info(`INFO: Flag added Now Updating Flag count in meme table`);
        const { error: countError } = await updateFlagCount(flagData.contentId, memeData[0].flag_count + 1);

        if (countError) {
            console.log('ERROR: During updating Flag count ');
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${countError.message}`
            )
        }

        console.info(`INFO: Returning Success Response with flag added message`);
        return SuccessResponse(FLAG_MODULE_SUCCESS_MESSAGES.FLAG_ADDED, HTTP_STATUS_CODE.CREATED, addedFlag);

    } catch (error) {

        console.error("ERROR: Internal Error while adding comment:", error);
        return ErrorResponse(
            HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
            `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR} ${error}`,

        );
    }
}


