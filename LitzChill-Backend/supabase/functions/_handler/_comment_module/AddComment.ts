
import { Comment } from "@model/CommentModle.ts";
import { getCommentById, updateCommentsCount } from "@repository/_comment_repo/CommentRepository.ts";
import { addComment, checkMemeId } from "@repository/_comment_repo/CommentRepository.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";

import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { Logger } from "@shared/_logger/Logger.ts";
import { COMMENT_MODULE_ERROR_MESSAGES, COMMENT_MODULE_SUCCESS_MESSAGES } from "@shared/_messages/CommentModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { validateCommentDetails } from "@shared/_validation/CommentDetailsValidation.ts";

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
   
   const logger=Logger.getloggerInstance();
   try {

      
      const commentDetails: Comment = await req.json();
      logger.info(`parsed json body and get comment details,${commentDetails}`);

      

      //validating comment details.
      logger.info(`calling validation function to validate comment details`);
      const validationErrors = validateCommentDetails(commentDetails);

      if (validationErrors instanceof Response) {
         logger.error(`Comment Validation Failed: , ${validationErrors}`);
         return validationErrors;
      }

      //getting user id from params object and assining into commentdetails object.
       commentDetails.user_id=params.user_id;
       logger.info(`successfully fetched user_id ${commentDetails.user_id}`);


       //If user adding a comment to meme checking meme is presnt or not
      if(commentDetails.contentType==='Meme'){

         commentDetails.meme_id=commentDetails.contentId

         logger.info(`calling repository function to get meme details by meme id ${commentDetails.meme_id}`);
         const{data:memeData,error:memeError}=await checkMemeId(commentDetails.meme_id);

         if(memeError){
            logger.error(`While Getting Meme Details By Meme Id ,${memeError.message}`);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                memeError.message
            )
         }

         if(!memeData||memeData.length==0){
            logger.error(`No Meme Found With Provided Meme Id ${commentDetails.meme_id}`);
            return ErrorResponse(
                HTTP_STATUS_CODE.NOT_FOUND,
                COMMENT_MODULE_ERROR_MESSAGES.CONTENT_NOT_FOUND 
            )
         }
         logger.info("Initialzig Comment count from meme data");
         commentDetails.commentCount=memeData[0].comment_count;
      }
      
      //If user giving reply to a comment checking comment is presnt or not
      else if(commentDetails.contentType==='Comment'){

         commentDetails.parent_commentId=commentDetails.contentId

         logger.info(`calling repository function to get comment details by comment id ${commentDetails.commentid}`);
         const{data:commentData,error:commentError}=await getCommentById(commentDetails.contentId);


         if(commentError){
            logger.error(`While Getting comment Details By Comment Id, ${commentError.message}`);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                commentError.message
            )
         }
         if(!commentData||commentData.length==0){
            logger.error(`NO Comment found with provided comment_id ${commentDetails.commentid}`);
            return ErrorResponse(
                HTTP_STATUS_CODE.NOT_FOUND,
                COMMENT_MODULE_ERROR_MESSAGES.COMMENT_NOT_FOUND 
            )
         }

         logger.info("Initialzig Comment count and meme id form comment data");
         commentDetails.commentCount=commentData[0].memes.comment_count;
         commentDetails.meme_id=commentData[0].meme_id;
      }

      logger.info(`Initializing created_at date with current date. and comment status to A(Active)`);
         commentDetails.created_at=new Date().toISOString();
         commentDetails.status='A';

         
         logger.info('Calling addComment repository function to add comment');
         const{data: addedComment,error: addCommentError}=await addComment(commentDetails);


         if(addCommentError){
            logger.error(`While Adding comment , ${addCommentError.message}`);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                addCommentError.message
            )
         }

         if(!addedComment||addComment.length==0){
            logger.error(`Comment not added due to some error`);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                COMMENT_MODULE_ERROR_MESSAGES.FAILED_TO_ADD_COMMENT 
            )
         }

         //Updating comment count in meme table
         logger.info(`Current comment count is: ${commentDetails.commentCount}`);
         logger.info(`Comment added Now Updating comment count in meme table`);
         const {error: counterror}=await updateCommentsCount(commentDetails.meme_id,commentDetails.commentCount+1);

         if(counterror){
            logger.error(`During updating comment count ${counterror.message}`);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${counterror.message}`
            )
         }

         logger.info(`Returning Success Response with comment added message`);
         return SuccessResponse(
            COMMENT_MODULE_SUCCESS_MESSAGES.COMMENT_ADDED,
            HTTP_STATUS_CODE.OK
         )
   } 
   catch (error) {

      // Handling any errors that occur during the comment adding process
      logger.error(`Internal Error while adding comment:, ${error}`);
      return ErrorResponse(
         HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
         `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR},${error}`
      )
   }
}
