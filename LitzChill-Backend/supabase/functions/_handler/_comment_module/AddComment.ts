
import { Comment } from "../../_model/CommentModle.ts";
import { getCommentById, updateCommentsCount } from "../../_repository/_comment_repo/CommentRepository.ts";
import { addComment, checkMemeId } from "../../_repository/_comment_repo/CommentRepository.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";

import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMENT_MODULE_ERROR_MESSAGES, COMMENT_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/CommentModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateCommentDetails } from "../../_shared/_validation/CommentDetailsValidation.ts";

/**
 * Handles the adding comment or reply on comment to existing meme by validating contentType and ContentId
 * 
 * @param {Request} req - The HTTP request object ontaining the comment details in the body.
 * @param {Record<string, string>} params - Additional URL parameters contains(User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 *
 * - SUCCESS: Returns a 200 OK response with add comment success message .
 * - FAILURE: On failure due to validation or database issues, returns an appropriate error response.
 */

export async function handleAddComment(req: Request, params: Record<string, string>): Promise<Response> {
   try {

      const commentDetails: Comment = await req.json();
      console.info("INFO: Request Recieved With Comment details",commentDetails);


      //validating comment details.
      const validationErrors = validateCommentDetails(commentDetails);

      if (validationErrors instanceof Response) {
         console.error("ERROR: Comment Validation Failed: ",validationErrors);
         return validationErrors;
      }

       commentDetails.user_id=params.user_id;

       //If user adding a comment to meme checking meme is presnt or not
      if(commentDetails.contentType==='Meme'){
         commentDetails.meme_id=commentDetails.contentId
         console.info("INFO: Getting Meme Details By Meme Id",commentDetails.meme_id);

         const{data:memeData,error:memeError}=await checkMemeId(commentDetails.meme_id);

         if(memeError){
            console.error("ERROR: While Getting Meme Details By Meme Id",memeError.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                memeError.message
            )
         }

         if(!memeData||memeData.length==0){
            console.error("ERROR: No Meme Found With Provided Meme Id");
            return ErrorResponse(
                HTTP_STATUS_CODE.NOT_FOUND,
                COMMENT_MODULE_ERROR_MESSAGES.CONTENT_NOT_FOUND 
            )
         }
         console.info("INFO: Initialzig Comment count from meme data");
         commentDetails.commentCount=memeData[0].comment_count;
      }
      
      //If user giving reply to a comment checking comment is presnt or not
      else if(commentDetails.contentType==='Comment'){
         commentDetails.parent_commentId=commentDetails.contentId
         console.info("INFO: Getting Meme Details By comment Id: ",commentDetails.parent_commentId);

         const{data:commentData,error:commentError}=await getCommentById(commentDetails.contentId);
         if(commentError){
            console.error("ERROR: While Getting comment Details By Comment Id",commentError.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                commentError.message
            )
         }
         if(!commentData||commentData.length==0){
            console.error("ERROR: NO Comment found with provided id");
            return ErrorResponse(
                HTTP_STATUS_CODE.NOT_FOUND,
                COMMENT_MODULE_ERROR_MESSAGES.COMMENT_NOT_FOUND 
            )
         }

         console.info("INFO: Initialzig Comment count and meme id form comment data");
         commentDetails.commentCount=commentData[0].memes.comment_count;
         commentDetails.meme_id=commentData[0].meme_id;
      }

        
         commentDetails.created_at=new Date().toISOString();
         commentDetails.status='A';

         //adding comment to a meme
         console.info('INFO: Calling addComment method to add comment');
         const{data: addedComment,error: addCommentError}=await addComment(commentDetails);


         if(addCommentError){
            console.error("ERROR: While Adding comment",addCommentError.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                addCommentError.message
            )
         }

         if(!addedComment||addComment.length==0){
            console.error("ERROR: Comment not added due to some problem");
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                COMMENT_MODULE_ERROR_MESSAGES.FAILED_TO_ADD_COMMENT 
            )
         }

         //Updating comment count in meme table
         console.info(`INFO: Comment added Now Updating comment count in meme table`);

         const {error: counterror}=await updateCommentsCount(commentDetails.meme_id,commentDetails.commentCount+1);

         if(counterror){
            console.error('ERROR: During updating comment count ');
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${counterror.message}`
            )
         }

         console.info(`INFO: Returning Success Response with comment added message`);
         return SuccessResponse(
            COMMENT_MODULE_SUCCESS_MESSAGES.COMMENT_ADDED,
            HTTP_STATUS_CODE.OK
         )
   } 
   catch (error) {

      // Handling any errors that occur during the comment adding process
      console.error("ERROR: Internal Error while adding comment:", error);
      return ErrorResponse(
         HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
         `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR},${error}`
      )
   }
}
