import { Comment } from "../../_model/CommentModle.ts";
import supabase from "../../_shared/_config/DbConfig.ts";
import { COMMENT_TABLE } from "../../_shared/_db_table_details/CommentTableFields.ts";

import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";

/**
 * Adds a comment to a meme and stores the comment data in the comment table.
 * 
 * @param commentData - An object containing the necessary comment data.
 * @returns {addedComment, commentError} - 
 * - If the comment is successfully added, `addedComment` contains the inserted data and `commentError` is null.
 * - If a database error occurs, `addedComment` will be null and `commentError` will contain the error details.
 */
export async function addComment(commentData: Comment) {
      const { data: addedComment, error:commentError } = await supabase
        .from(TABLE_NAMES.COMMENT_TABLE)
        .insert({'meme_id':commentData.meme_id,
                 'user_id':commentData.user_id,
                 'comment':commentData.comment,
                 'created_at':commentData.created_at,
                 'status':commentData.status,
                 'parent_commentid':commentData.parent_commentId

        })
        .select();

        return {addedComment,commentError};
}
  

/**
 * Fetches comment data by comment ID.
 * 
 * @param comment_id - The ID of the comment to retrieve.
 * @returns {data, error} - 
 *   - If the comment is successfully fetched, `data` contains the comment data and `error` is null.
 *   - If a database error occurs, `data` will be null and `error` will contain the error details.
 */

export async function getCommentById(comment_id:string) {
    const{data,error}=await supabase
       .from(TABLE_NAMES.COMMENT_TABLE)
       .select(`*,memes(comment_count)`)
       .eq(COMMENT_TABLE.COMMENT_ID,comment_id);

      return {data,error};
}


/**
 * Deletes a comment and all its replies by comment ID.
 * 
 * @param comment_id - The ID of the comment to delete.
 * @returns {deletedData, deleteCommentError} - 
 *  - If the comment and its replies are successfully deleted, `deletedData` contains the deleted data and `deleteCommentError` is null.
 *  - If a database error occurs, `deletedData` will be null and `deleteCommentError` will contain the error details.
 */

export async function deleteComment(comment_id:string) {
    const {data:deletedData,error:deleteCommentError} = await supabase
       .from(TABLE_NAMES.COMMENT_TABLE)
       .delete()
       .or(`comment_id.eq.${comment_id},parent_commentid.eq.${comment_id}`).select();
       
       return {deletedData,deleteCommentError};    
}


/**
 * Updates the comment count for a meme by its meme ID.
 * 
 * @param meme_id - The ID of the meme to update the comment count.
 * @param newCommentCount - The new comment count to set for the meme.
 * @returns {counterror} - If a database error occurs, `counterror` will contain the error details; otherwise, it will be null.
 */
export async function updateCommentsCount(meme_id: string, newCommentCount: number) {

  const { error: counterror } = await supabase
    .from(TABLE_NAMES.MEME_TABLE)
    .update({ comment_count: newCommentCount })
    .eq('meme_id', meme_id);

  return { counterror };
}


/**
 * Checks if the content exists with the provided content ID (meme ID).
 * 
 * @param contentID - The ID of the meme to check for existence.
 * @returns {data, error} - 
 *    - If the meme exists, `data` contains the meme data and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */
export async function checkMemeId(contentID: string) {

  const { data, error } = await supabase
    .from(TABLE_NAMES.MEME_TABLE)
    .select('*')
    .eq('meme_id', contentID);

  return { data, error };
}
