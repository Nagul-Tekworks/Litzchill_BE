import supabase from "../../_shared/_config/DbConfig.ts";
import { LIKE_TABLE_FIELDS } from "../../_shared/_db_table_details/LikeTableFields.ts";
import { MEMEFIELDS } from "../../_shared/_db_table_details/MemeTableFields.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";
import Logger from "../../_shared/Logger/logger.ts";

 const logger = Logger.getInstance();

/**
 * Function to check if a like exists for a given meme_id and user_id.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param user_id - The unique identifier of the user.
 * @returns {Promise<{ data: object | null, error: object | null }>} - The like data if found, or null if not found or an error occurs.
 */
export async function checkLikeExists(meme_id: string, user_id: string): Promise<{ data: object | null, error: object | null }> {
    const { data, error } = await supabase
        .from(TABLE_NAMES.LIKES_TABLE)
        .select(LIKE_TABLE_FIELDS.LIKE_ID)
        .eq(LIKE_TABLE_FIELDS.USER_ID, user_id)
        .eq(LIKE_TABLE_FIELDS.MEME_ID, meme_id)
        .single();
    
        logger.info(data+" "+error);

    if (error || !data) 
        return { data: null, error };
    return { data, error: null };
}

/**
 * Function to insert a like for a meme.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param user_id - The unique identifier of the user.
 * @param likeable_type - The type of likeable entity (e.g., meme).
 * @returns {Promise<{ data: object | null, error: object | null }>} - The inserted like data if successful, or null if not inserted or an error occurs.
 */

export async function insertLikeQuery(
    meme_id: string, 
    user_id: string, 
    likeable_type: string
  ): Promise<{ data: object | null, error: object | null }> {
    const { data, error } = await supabase
      .from('likes')
      .upsert(
        [{ meme_id, user_id, likeable_type, created_at: new Date().toISOString() }],
        { onConflict: 'meme_id, user_id' } // Conflict resolution based on meme_id and user_id
      );
    if (error) {
      return { data: null, error };
    }
  
    return { data, error: null };
  }
  
  
/**
 * Function to unlike a meme.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param user_id - The unique identifier of the user.
 * @returns {Promise<boolean>} - Returns true if successful, or false if there’s an error.
 */
export async function unlikememe(meme_id: string, user_id: string): Promise<boolean> {
    const { error } = await supabase
        .from(TABLE_NAMES.LIKES_TABLE)
        .delete()
        .eq(LIKE_TABLE_FIELDS.USER_ID, user_id)
        .eq(LIKE_TABLE_FIELDS.MEME_ID, meme_id);

        logger.info("unlike error"+error);

    return !error;
}

/**
 * Function to update like count in the meme table.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param like_count - The updated like count.
 * @returns {Promise<{ data: object | null, error: object | null }>} - The updated like count if successful, or null if not updated or an error occurs.
 */
export async function updateLikeCount(meme_id: string, like_count: number): Promise<{ data: object | null, error: object | null }> {
    const { data, error } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .update({ like_count: like_count })
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .select("meme_id, like_count")
        .single();

        logger.info(data+" "+error);
    if (error) return { data: null, error };
    return { data, error: null };
}

