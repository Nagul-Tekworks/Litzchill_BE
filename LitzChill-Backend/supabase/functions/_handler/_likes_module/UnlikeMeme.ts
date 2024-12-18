import { checkLikeExists, unlikememe, updateLikeCount } from "../../_repository/_like_repo/LikeQueries.ts";
import { meme_exists } from "../../_repository/_meme_repo/MemeRepository.ts";
import { ErrorResponse } from "../../_responses/Response.ts";
import { SuccessResponse } from '../../_responses/Response.ts';
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { MEME_ERROR_MESSAGES } from '../../_shared/_messages/Meme_Module_Messages.ts';
import { LIKE_ERROR } from "../../_shared/_messages/LikeMessage.ts";
import { HTTP_STATUS_CODE } from '../../_shared/_constants/HttpStatusCodes.ts';
import { LIKE_SUCCESS } from '../../_shared/_messages/LikeMessage.ts';
import Logger from "../../_shared/Logger/logger.ts";



/**
 * Removes a like from a meme by a user and updates the like count.
 * 
 * @param {Request} req - The HTTP request object containing the user and meme data.
 * @param {Record<string, string>} params - The URL parameters, including the user ID and meme ID.
 * @returns {Promise<Response>} - The response indicating the success or failure of the operation.
 * 
 * @throws {Error} - If the meme is not found, the user has not liked the meme, or there is an issue removing the like or updating the like count.
 */
export default async function unlikememes(_req: Request, params: Record<string, string>):Promise<Response> {
         const logger = Logger.getInstance();
    try {
        const user_id = params.user_id;
        const meme_id = params.id;

        logger.info(`Processing unlikeMeme handler for user_id: ${user_id} and meme_id: ${meme_id}`);

        // Validate the meme_id parameter
        if (!meme_id || !V4.isValid(meme_id)) { 
           logger.error ("Validation failed: Missing parameters.");
            return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

        const existingMeme = await meme_exists(meme_id);
        if (!existingMeme) {
            logger.error("meme not found");
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.MEME_NOT_FOUND);
        }

        const { data: liked, error } = await checkLikeExists(meme_id, user_id);
        if (error || !liked) {
            logger.error(`User ${user_id} has not liked meme ${meme_id}`);
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, LIKE_ERROR.NOTLIKED);
        } else if(liked){
            logger.info(`User ${user_id}  liked meme ${meme_id}`);
        }
        // Remove the like entry
        const unlikedmeme = await unlikememe(meme_id, user_id);
        if (!unlikedmeme) {
            logger.error("failed to unlike meme");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, LIKE_ERROR.UNLIKE_FAILED);
        }

        // Update the meme's like count - decrement the like count in the memes table
        const likecount = await updateLikeCount(meme_id, existingMeme.like_count - 1);
        if (!likecount) {
            logger.error("Failed to update like status");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, LIKE_ERROR.UPDATE_FAILED);
        }

        logger.info(`Unliked meme ${meme_id} for user ${user_id}`);
        return SuccessResponse(HTTP_STATUS_CODE.OK, LIKE_SUCCESS.UNLIKED_SUCCESSFULLY);
    } catch (error) {
        logger.error("Error updating meme:"+ error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
