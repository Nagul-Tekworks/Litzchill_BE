
import { deleteComment, getCommentById, updateCommentsCount } from "@repository/_comment_repo/CommentRepository.ts";
import  {ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { Logger } from "@shared/_logger/Logger.ts";
import { COMMENT_MODULE_ERROR_MESSAGES, COMMENT_MODULE_SUCCESS_MESSAGES } from "@shared/_messages/CommentModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { validateCommentId } from "@shared/_validation/CommentDetailsValidation.ts";

/**
 * Handles the deletion of comment with all  replies on existing meme by comment id.
 * 
 * @param {Request} _req - The HTTP request object 
 * @param {Record<string, string>} params - Additional URL parameters contains(Comment id, User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 *
 * - SUCCESS: Returns a 200 OK response with delete comment success message .
 * - FAILURE: On failure due to validation or database issues, returns an appropriate error response.
 */

export async function handleDeleteComment(_req: Request, params: Record<string, string>): Promise<Response> {
   
    const logger=Logger.getloggerInstance();
    try {

        //getting comment id from parms object.
        const commentId = params.id;
        logger.info(`Request Recieved To Delete Comment With Id: ${commentId}`);


        // Checking if commentId is provided
        logger.info(`Validating comment id`);
        const validatedId = validateCommentId(commentId);
        if (validatedId instanceof Response) {
            logger.error(`Comment Id Validation Failed ${validatedId}`);
             return validatedId;
        }

        // Checking if the comment exists in the database 
        logger.info(`calling repository function to check comment id present or not into database`);
        const { data:commentData, error:commentError } = await getCommentById(commentId);

        
        //returning error response if any database error come
        if (commentError) {
            logger.error(`Database error during getting comment data, ${commentError.message}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${commentError.message}`
            )
        }

        //if comment not found with provided id returnign not found response.
        if (!commentData || commentData.length === 0) {
            logger.error(`Comment with ID ${commentId} not found.`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.NOT_FOUND,
                 COMMENT_MODULE_ERROR_MESSAGES.COMMENT_NOT_FOUND,

            );
        }

        
        // Checking if the user is the owner of the comment
        if (commentData[0].user_id !== params.user_id) {
            logger.error(`User Don't have permission to delete comment `);
            return ErrorResponse(
                 HTTP_STATUS_CODE.FORBIDDEN,
                 COMMON_ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
            );
        }

      

        // Deleting the comment from the database
        logger.info(`calling repository function deleteComment() to delete comment and its all replies`);
        const { data:deletedData,error:deleteCommentError } = await deleteComment(commentId);
        

        //returning error response if any database error come
        if (deleteCommentError) {
            logger.error(`Database error during deleting  comment, ${deleteCommentError}`);
            return ErrorResponse(
                  HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${deleteCommentError.message}`
            )
        }

        if(!deletedData||deletedData.length==0){
            logger.error('Comment Not Deleted Due to some error');
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 COMMENT_MODULE_ERROR_MESSAGES.COMMENT_NOT_DELETED
            )
        }

        logger.info('Comment deleted now getting the length of deleted comment count')
        const commentCountOnMeme = commentData[0].memes.comment_count>0?commentData[0].memes.comment_count-(deletedData.length):0;

        // Updating the comment count in the meme table
        logger.info(`calling updateCommentsCount function to update comment count `);
        const { error:counterror } = await updateCommentsCount(commentData[0].meme_id, commentCountOnMeme);
      
        if (counterror) {
            logger.error(`error during updating comment count `);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${counterror.message}`
            )
        }
         
        // Sending a successful response after deletion
        logger.info('Returning Success Response with deleted message');
        return SuccessResponse(
             COMMENT_MODULE_SUCCESS_MESSAGES.COMMENT_DELETED,
             HTTP_STATUS_CODE.OK
        );
    } 
    catch (error) {

        // handling any errors during the delete process
        logger.error(`get internal server error while deleting comment ${error}`);
        return ErrorResponse(
              HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR},${error}`
        )
    }
}
