import { checkLikeExists, insertLikeQuery, updateLikeCount } from "../../_repository/_like_repo/LikeQueries.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { LIKE_ERROR } from "../../_shared/_messages/LikeMessage.ts";
import { NOTIFICATION_TYPES } from '../../_shared/_constants/Types.ts';
import { addNotifications } from "../../_repository/_notifications_repo/NotificationsQueries.ts";
import { COMMON_ERROR_MESSAGES } from '../../_shared/_messages/ErrorMessages.ts';
import { LIKE_SUCCESS } from '../../_shared/_messages/LikeMessage.ts';


export default async function likememe(req: Request,params: Record<string, string>) {
    try {
        const { meme_id, user_id } = params;
        // Check if the user has already liked the meme
        const liked = await checkLikeExists(meme_id, user_id);
        if (liked) {
            return ErrorResponse(HTTP_STATUS_CODE.CONFLICT,LIKE_ERROR.ALREADYLIKED)
        }

        // Insert a new like record
        const {data:likememe,error} = await insertLikeQuery(meme_id, user_id);
        if (error) {
          console.log("failed to like meme")
          return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,LIKE_ERROR.INSERTION_FAILED)
        }

        // Increment the like count in the memes table
        const likecount = await updateLikeCount(meme_id,existingmeme.like_count + 1);
        if (!likecount) {
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,LIKE_ERROR.)
        }
  
        // Notify the meme owner that a new like has been added
        const type = NOTIFICATION_TYPES.LIKE;
        const notify = await addNotifications(user_id,existingmeme.meme_title,type);
        if (!notify) {
            console.error("Failed to notify meme owner");
        }
        return SuccessResponse(HTTP_STATUS_CODE.OK,LIKE_SUCCESS.LIKED_SUCCESSFULLY)
    } 
    catch (error) {
        console.error("Error updating meme:", error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
}
