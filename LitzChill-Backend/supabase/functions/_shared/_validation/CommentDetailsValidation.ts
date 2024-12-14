import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import {  COMMENT_VALIDATION_MESSAGES } from "../_messages/CommentModuleMessages.ts";
import {ErrorResponse} from "../../_responses/Response.ts";
import { Comment } from "../../_model/CommentModle.ts";
import { COMMON_ERROR_MESSAGES } from "../_messages/ErrorMessages.ts";

/**
 * Validates the provided comment ID is .
 * 
 * @param comment_id - The ID of the comment to validate.
 * @returns {Response|null} - Returns an error response if the comment ID is invalid, otherwise returns null.
 * 
 */

export function validateCommentId(comment_id:string):Response|null{
    if (comment_id ) {
      if (!V4.isValid(comment_id)) {
        console.log("Error: Missing commentId in the request.");
        return ErrorResponse(
               HTTP_STATUS_CODE.BAD_REQUEST,
              COMMENT_VALIDATION_MESSAGES.INVALID_COMMENT_ID,
        )
     } 
    }else{
      return ErrorResponse(
         HTTP_STATUS_CODE.BAD_REQUEST,
         COMMENT_VALIDATION_MESSAGES.MISSING_COMMENT_ID
      )
    }

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

    console.log("INFO: Validating comment details...");

    // Check if all required fields are provided
    if (Object.keys(commetData).length==0) {
      console.error("ERROR: Empty Body");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             COMMON_ERROR_MESSAGES.EMPTY_REQUEST_BODY,
        )
    } 

    //checking for valid content type
    if(commetData.contentType){
      if(commetData.contentType!=='Meme'&&commetData.contentType!=='Comment'){
        console.error("ERROR: Invalid Content Type: ",commetData.contentType);
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             COMMENT_VALIDATION_MESSAGES.INVALID_CONTENT_TYPE
        )
      }
    }else{
      console.error("ERROR: Missing Content Type");
      return ErrorResponse(
          HTTP_STATUS_CODE.BAD_REQUEST,
          COMMENT_VALIDATION_MESSAGES.MISSING_CONTENT_TYPE
      )
    }

    //checking for valid content id
     if(commetData.contentId){
       if(!V4.isValid(commetData.contentId)){
        console.error('ERROR: Inavlid Content Id: ',commetData.contentId);
             return ErrorResponse(
                  HTTP_STATUS_CODE.BAD_REQUEST,
                  COMMENT_VALIDATION_MESSAGES.INAVLID_CONTENT_ID
             )
       }
    }else{
      console.error('ERROR: Missing Content Id');
       return ErrorResponse(
          HTTP_STATUS_CODE.BAD_REQUEST,
          COMMENT_VALIDATION_MESSAGES.MISSING_CONTENT_ID
       )
    } 


    if(!commetData.comment||commetData.comment.trim().length==0){
      console.error('ERROR: Missing Comment Message');
      return ErrorResponse(
         HTTP_STATUS_CODE.BAD_REQUEST,
         COMMENT_VALIDATION_MESSAGES.MISSING_COMMENT_MESSAGE
      )
    }
  console.log("INFO: Comment details validated successfully.");
  return null;
}
