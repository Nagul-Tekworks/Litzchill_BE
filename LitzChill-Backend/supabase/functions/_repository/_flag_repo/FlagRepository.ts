
import { FlagModel } from "@model/FlagModel.ts";
import supabase from "@shared/_config/DbConfig.ts";
import { FLAG_TABLE } from "@shared/_db_table_details/FlagTableFields.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";

/**
 * Checks if a user has already flagged a meme.
 * 
 * @param user_id - The ID of the user.
 * @param meme_id - The ID of the meme to check.
 * @returns {data, error} - 
 *    - If the user has already flagged the meme, `data` contains the flag data and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */

export async function checkUserAlreadyFlag(user_id:string,meme_id:string) :Promise<{ data: any; error: any }> {
    
        const{data,error}=await supabase
          .from(TABLE_NAMES.FLAG_TABLE)
          .select('*')
          .eq(FLAG_TABLE.USER_ID,user_id)
          .eq(FLAG_TABLE.MEME_ID,meme_id);

        return {data,error};
            
}

/**
 * Adds a flag to a meme to indicate an issue or violation.
 * 
 * @param flagData - flag data contain all flag details
 * @returns {data, error} - 
 *    - If the flag is successfully added, `data` contains the inserted flag data and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */


export async function addFlagToMeme(flagData:FlagModel) :Promise<{data:any,error:any}>{
    const { data, error } = await supabase
         .from(TABLE_NAMES.FLAG_TABLE)
         .insert({[FLAG_TABLE.MEME_ID]:flagData.contentId,
             [FLAG_TABLE.USER_ID]:flagData.user_id,
             [FLAG_TABLE.FLAG_REASON]:flagData.reason,
             [FLAG_TABLE.FLAG_CREATED_AT]:flagData.created_at
          })
         .select();

         return {data,error} 
}


/**
 * Updates the flag count of a meme.
 * 
 * @param meme_id - The ID of the meme whose flag count needs to be updated.
 * @param newFlagCount - The new flag count to be set for the meme.
 * @returns {error};
 } - 
 *    - If the flag count is successfully updated, `error` will be null.
 *    - If a database error occurs, `error` will contain the error details.
 */
export async function updateFlagCount(meme_id: string, newFlagCount: number): Promise<{error:any}> {
  const { error } = await supabase
    .from(TABLE_NAMES.MEME_TABLE)
    .update({ flag_count: newFlagCount })
    .eq('meme_id', meme_id);

  return { error };
}
