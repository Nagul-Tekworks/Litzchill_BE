import supabase from "../../_shared/_config/DbConfig.ts";


/*
 function to check if like exists for a given meme_id and user_id
 returns like_id if found, otherwise null  - null if not found or error occurred  - data if found
 Note: this function assumes that the likes table has a unique constraint on meme_id and user_id
 (this is usually the case in a real-world application)
 -1 is returned if no like exists, as the query will return null when no matching rows are found
 -1 is also returned if an error occurs during the query execution.
*/
export async function checkLikeExists(meme_id: string, user_id: string) {
    const { data, error } = await supabase
   .from("likes")
   .select("like_id")
   .eq("meme_id", meme_id)
   .eq("user_id", user_id)
   .single();

    if(error || !data) return null;
    return data;
}

/*
 function to insert like
 returns like_id if inserted, otherwise null  - null if not inserted or error occurred  - data if inserted
*/

export async function insertLikeQuery(meme_id: string, user_id: string) {
    const { data, error } = await supabase
    .from("likes")
    .insert([{
        meme_id: meme_id,
        user_id: user_id,
    }])
    .select("like_id")
    .single();
     return {data,error}
}

/*
 Function to unlike meme
 */
 export async function unlikememe(meme_id:string,user_id:string)
 {
     const { error } = await supabase
     .from('likes')
     .delete()
     .eq('user_id', user_id)
     .eq('meme_id', meme_id);
 
     if(error) return null;
     return true;
 }

/*
 Function to update like status into meme table
 returns updated meme_id and like_count if updated, otherwise null  - null if not updated or error occurred  - data if updated
 */
export async function updateLikeCount(meme_id: string, like_count: number) {
    const { data, error } = await supabase
    .from("memes")
    .update({ like_count: like_count})
    .eq("meme_id", meme_id)
    .select("meme_id, like_count")
    .single();

    if(error || !data) return null;
    return data;
}
