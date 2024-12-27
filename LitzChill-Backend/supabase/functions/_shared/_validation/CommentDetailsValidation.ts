import { V4 } from "@V4";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import {  COMMENT_VALIDATION_MESSAGES } from "@shared/_messages/CommentModuleMessages.ts";
import {ErrorResponse} from "@response/Response.ts";
import { Comment } from "@model/CommentModle.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { Logger } from "@shared/_logger/Logger.ts";

/**
 * Validates the provided comment ID is .
 * 
 * @param comment_id - The ID of the comment to validate.
 * @returns {Response|null} - Returns an error response if the comment ID is invalid, otherwise returns null.
 * 
 */

export function validateCommentId(comment_id:string):Response|null{
    const logger=Logger.getloggerInstance();
    if (comment_id ) {
      if (!V4.isValid(comment_id)) {
        logger.error("Invalid commentId in the request.");
        return ErrorResponse(
               HTTP_STATUS_CODE.BAD_REQUEST,
              COMMENT_VALIDATION_MESSAGES.INVALID_COMMENT_ID,
        )
     } 
    }else{
      logger.error("Missing commentId in the request.");
      return ErrorResponse(
         HTTP_STATUS_CODE.BAD_REQUEST,
         COMMENT_VALIDATION_MESSAGES.MISSING_COMMENT_ID
      )
    }

    logger.info(`Comment id validated successfully`);
    return null;
}


/**
 * Validates the details of a comment.
 * 
 * @param commentData - The Comment object that contains the details to validate.
 * @returns {Response|null} - Returns an error response if validation fails, otherwise null.
 * 
 * - If any required field is missing or invalid, an error response will be returned with a corresponding message.
 * - This function ensures that the content type, content ID, and comment message are all valid.
 */
export function validateCommentDetails(commetData:Comment):Response|null {
  const logger=Logger.getloggerInstance();
  logger.info("Validating comment details...");

    // Check if all required fields are provided
    if (Object.keys(commetData).length==0) {
      logger.error("Empty Body returning empty body response with error message");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             COMMON_ERROR_MESSAGES.EMPTY_REQUEST_BODY,
        )
    } 

    //checking for valid content type
    if(commetData.contentType){
      if(commetData.contentType!=='Meme'&&commetData.contentType!=='Comment'){
        logger.error(`ERROR: Invalid Content Type:, ${commetData.contentType}`);
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             COMMENT_VALIDATION_MESSAGES.INVALID_CONTENT_TYPE
        )
      }
    }else{
      logger.error("Missing Content Type sending error response");
      return ErrorResponse(
          HTTP_STATUS_CODE.BAD_REQUEST,
          COMMENT_VALIDATION_MESSAGES.MISSING_CONTENT_TYPE
      )
    }

    //checking for valid content id
     if(commetData.contentId){
       if(!V4.isValid(commetData.contentId)){
        logger.error(` Inavlid Content Id:, ${commetData.contentId}`);
             return ErrorResponse(
                  HTTP_STATUS_CODE.BAD_REQUEST,
                  COMMENT_VALIDATION_MESSAGES.INAVLID_CONTENT_ID
             )
       }
    }else{
      logger.error('Missing Content Id sending error response');
       return ErrorResponse(
          HTTP_STATUS_CODE.BAD_REQUEST,
          COMMENT_VALIDATION_MESSAGES.MISSING_CONTENT_ID
       )
    } 


    if(!commetData.comment||commetData.comment.trim().length==0){
      logger.error('Missing Comment Message sending error message');
      return ErrorResponse(
         HTTP_STATUS_CODE.BAD_REQUEST,
         COMMENT_VALIDATION_MESSAGES.MISSING_COMMENT_MESSAGE
      )
    }
    logger.info("Comment details validated successfully.");
  return null;
}
