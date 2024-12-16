import { checkLikeExists, insertLikeQuery, updateLikeCount } from "../../_repository/_like_repo/LikeQueries.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { LIKE_ERROR } from "../../_shared/_messages/LikeMessage.ts";
import { NOTIFICATION_TYPES } from '../../_shared/_constants/Types.ts';
import { addNotifications } from "../../_repository/_notifications_repo/NotificationsQueries.ts";
import { COMMON_ERROR_MESSAGES } from '../../_shared/_messages/ErrorMessages.ts';
import { LIKE_SUCCESS } from '../../_shared/_messages/LikeMessage.ts';
import { meme_exists } from "../../_repository/_meme_repo/MemeRepository.ts";
import { MEME_ERROR_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";

/**
 * Handles the process of liking a meme by a user, including validation, insertion, and updating the like count.
 * 
 * @param {Request} req - The HTTP request object, which contains the user ID and meme ID in the parameters.
 * @param {Record<string, string>} params - The URL parameters containing the user ID and meme ID.
 * @returns {Promise<Response>} - The response object, indicating success or failure of the like operation.
 * 
 * @throws {Error} - If an error occurs during any of the following:
 *   - Invalid or missing meme ID.
 *   - Meme not found.
 *   - User has already liked the meme.
 *   - Failure to insert like or update like count.
 *   - Failure to notify the meme owner.
 */
export default async function likememe(_req: Request, params: Record<string, string>) {
    try {
        const user_id = params.user_id;
        const meme_id = params.id;

        // Validate the meme_id parameter
        if (!meme_id || !V4.isValid(meme_id)) { 
            console.log("Validation failed: Missing or invalid meme_id.");
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

        // Step 1: Check if meme exists
        const existingMeme = await meme_exists(meme_id);
        if (!existingMeme) {
            console.log(`Meme with ID ${meme_id} not found.`);
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.MEME_NOT_FOUND);
        }
        console.log(`Meme with ID ${meme_id} exists.`);

        // Step 2: Check if the user has already liked the meme
        const { data: liked, error } = await checkLikeExists(meme_id, user_id);
        if (error || !liked) {
            console.log(`User ${user_id} has not liked meme ${meme_id}`);
        } else if(liked){
            console.log(`User ${user_id} already liked meme ${meme_id}`);
            return SuccessResponse(HTTP_STATUS_CODE.OK, LIKE_SUCCESS.LIKED_SUCCESSFULLY);  // New message for already liked
        }
        

        // Step 3: Insert a new like record
        const likeable_type = "meme";
        const { data: _likeMeme, error: likeError } = await insertLikeQuery(meme_id, user_id, likeable_type);
        if (likeError) {
            console.error(`Failed to like meme ${meme_id} by user ${user_id}`, likeError);
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, LIKE_ERROR.INSERTION_FAILED);
        }

        // Step 4: Update the like count in the memes table
        const updatedLikeCount = existingMeme.like_count + 1;
        const { error: updateError } = await updateLikeCount(meme_id, updatedLikeCount);
        if (updateError) {
            console.error(`Failed to update like count for meme ${meme_id}`, updateError);
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, LIKE_ERROR.UPDATE_FAILED);
        }

        // Step 5: Notify the meme owner about the like
        const type = NOTIFICATION_TYPES.LIKE;
        const status = LIKE_SUCCESS.LIKE_RECEIVED;
        const notify = await addNotifications(user_id, existingMeme.meme_title, type, status);
        if (!notify) {
            console.error(`Failed to notify meme owner for meme ${meme_id}`);
            throw new Error("Notification failed");
        }

        console.log(`User ${user_id} liked meme ${meme_id} successfully.`);
        return SuccessResponse(HTTP_STATUS_CODE.OK, LIKE_SUCCESS.LIKED_SUCCESSFULLY);
    } catch (error) {
        console.error("Error processing like:", error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
