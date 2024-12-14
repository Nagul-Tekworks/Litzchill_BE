
import { deleteComment, getCommentById, updateCommentsCount } from "../../_repository/_comment_repo/CommentRepository.ts";
import  {ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMENT_MODULE_ERROR_MESSAGES, COMMENT_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/CommentModuleMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateCommentId } from "../../_shared/_validation/CommentDetailsValidation.ts";

/**
 * Handles the deletion of comment with all  replies on existing meme by comment id.
 * 
 * @param {Request} req - The HTTP request object 
 * @param {Record<string, string>} params - Additional URL parameters contains(Comment id, User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 *
 * - SUCCESS: Returns a 200 OK response with delete comment success message .
 * - FAILURE: On failure due to validation or database issues, returns an appropriate error response.
 */

export async function handleDeleteComment(req: Request, params: Record<string, string>): Promise<Response> {
    try {

        const commentId = params.id;

        console.info('INFO: Request Recieved To Delete Comment With Id: ',commentId);

        // Checking if commentId is provided
        const validatedId = validateCommentId(commentId);
        if (validatedId instanceof Response) {

             console.error('ERROR: Comment Id Validation Failed');
             return validatedId;
        }

        console.info('INFO: Getting comment data by comment id');
        // Checking if the comment exists in the database 
        const { data:commentData, error:commentError } = await getCommentById(commentId);

        
        //returning error response if any database error come
        if (commentError) {

            console.error("ERROR:Database error during getting comment data", commentError.message);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${commentError.message}`
            )
        }

        if (!commentData || commentData.length === 0) {

            console.error(`Error: Comment with ID ${commentId} not found.`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.NOT_FOUND,
                 COMMENT_MODULE_ERROR_MESSAGES.COMMENT_NOT_FOUND,

            );
        }
        
        // Checking if the user is the owner of the comment
        if (commentData[0].user_id !== params.user_id) {

            console.error(`ERROR: User Don't have permission to delete comment`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.FORBIDDEN,
                 COMMON_ERROR_MESSAGES.UNAUTHORIZED_ACCESS,

            );
        }

      

        // Deleting the comment from the database
        console.info('INFO: Deleting comment from comment table');
        const { data:deletedData,error:deleteCommentError } = await deleteComment(commentId);
        

        //returning error response if any database error come
        if (deleteCommentError) {

            console.error("ERROR: Database error during deleting  comment", deleteCommentError);
            return ErrorResponse(
                  HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${deleteCommentError.message}`
            )
        }

        if(!deletedData||deletedData.length==0){

            console.error('ERROR: Comment Not Deleted Due to some error');
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 COMMENT_MODULE_ERROR_MESSAGES.COMMENT_NOT_DELETED
            )
        }
        const commentCountOnMeme = commentData[0].memes.comment_count>0?commentData[0].memes.comment_count-(deletedData.length):0;

        // Updating the comment count in the meme table
        const { error:counterror } = await updateCommentsCount(commentData[0].meme_id, commentCountOnMeme);
        if (counterror) {
            console.error('ERROR: During updating comment count ');
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${counterror.message}`
            )
        }
         
        // Sending a successful response after deletion
        console.info('INFO: Returning Success Response with delete message');
        return SuccessResponse(
             COMMENT_MODULE_SUCCESS_MESSAGES.COMMENT_DELETED,
             HTTP_STATUS_CODE.OK
        );
    } 
    catch (error) {

        // handling any errors during the delete process
        console.error("ERROR:  handling delete comment:", error);
        return ErrorResponse(
              HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR},${error}`
        )
    }
}
