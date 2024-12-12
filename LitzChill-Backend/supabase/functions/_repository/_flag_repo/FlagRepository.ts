import { FlagModel } from "../../_model/FlagModel.ts";
import supabase from "../../_shared/_config/DbConfig.ts";
import { FLAG_TABLE } from "../../_shared/_db_table_details/FlagTableFields.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";

/**
 * Checks if a user has already flagged a meme.
 * 
 * @param user_id - The ID of the user.
 * @param meme_id - The ID of the meme to check.
 * @returns {userflagData, flagerror} - 
 *    - If the user has already flagged the meme, `userflagData` contains the flag data and `flagerror` is null.
 *    - If a database error occurs, `userflagData` will be null and `flagerror` will contain the error details.
 */

export async function checkUserAlreadyFlag(user_id:string,meme_id:string) {
    
        const{data:userflagData,error:flagerror}=await supabase
          .from(TABLE_NAMES.FLAG_TABLE)
          .select('*')
          .eq(FLAG_TABLE.USER_ID,user_id)
          .eq(FLAG_TABLE.MEME_ID,meme_id);

        return {userflagData,flagerror};
            
}

/**
 * Adds a flag to a meme to indicate an issue or violation.
 * 
 * @param flag - An object containing the flag data, including 
 * `contentId` (meme ID), `user_id` (ID of the user flagging the meme), 
 * `reason` (reason for flagging), and `created_at` (timestamp of when the flag is created).
 * 
 * @returns {addedFlag, addFlagError} - 
 *    - If the flag is successfully added, `addedFlag` contains the inserted flag data and `addFlagError` is null.
 *    - If a database error occurs, `addedFlag` will be null and `addFlagError` will contain the error details.
 */
export async function addFlagToMeme(flag:FlagModel) {
    const { data: addedFlag, error:addFlagError } = await supabase
         .from(TABLE_NAMES.FLAG_TABLE)
         .insert({[FLAG_TABLE.MEME_ID]:flag.contentId,
             [FLAG_TABLE.USER_ID]:flag.user_id,
             [FLAG_TABLE.FLAG_REASON]:flag.reason,
             [FLAG_TABLE.FLAG_CREATED_AT]:flag.created_at
          })
         .select();

         return {addedFlag,addFlagError}
    
}


/**
 * Updates the flag count of a meme.
 * 
 * @param meme_id - The ID of the meme whose flag count needs to be updated.
 * @param newFlagCount - The new flag count to be set for the meme.
 * @returns {countError} - 
 *    - If the flag count is successfully updated, `countError` will be null.
 *    - If a database error occurs, `countError` will contain the error details.
 */
export async function updateFlagCount(meme_id: string, newFlagCount: number) {
  const { error: countError } = await supabase
    .from(TABLE_NAMES.MEME_TABLE)
    .update({ flag_count: newFlagCount })
    .eq('meme_id', meme_id);

  return { countError };
}
