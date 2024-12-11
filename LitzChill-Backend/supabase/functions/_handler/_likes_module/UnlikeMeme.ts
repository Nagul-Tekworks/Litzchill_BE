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



export default async function unlikememes(req: Request,user: Record<string, string>) {
    try {
      
        const {user_id,meme_id}=user;
        console.log("User_id is: ",user_id)

         // Validate the meme_id parameter
         if (!meme_id || !V4.isValid(meme_id)) { 
            console.log("Validation failed: Missing parameters.");
            return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

       
        const existingMeme = await meme_exists(meme_id);
        if (!existingMeme) {
            console.log("meme not found")
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,MEME_ERROR_MESSAGES.MEME_NOT_FOUND)
        }

        // Check if the user has already liked the meme
        const liked = await checkLikeExists(meme_id, user_id);
        if (!liked) {
           return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,LIKE_ERROR.NOTLIKED)
        }

        // 4. Remove the like entry
        const unlikedmeme = await unlikememe(meme_id, user_id);
        if (!unlikedmeme) {
            console.log("failed to unlike meme")
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,LIKE_ERROR.NOTLIKED)
        }

        // 5. Update the meme's like count - decrement  the like count in the memes table
        const likecount = await updateLikeCount(meme_id,existingMeme.like_count - 1);
        if (!likecount) {
           console.log("Failed to update like status")
        }
        return SuccessResponse(HTTP_STATUS_CODE.OK,LIKE_SUCCESS.UNLIKED_SUCCESSFULLY)
    } 
    catch (error) {
        console.error("Error updating meme:", error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
}

       
