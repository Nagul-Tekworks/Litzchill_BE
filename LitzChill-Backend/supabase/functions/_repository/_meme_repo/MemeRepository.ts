import supabase from "../../_shared/_config/DbConfig.ts";
import { BUCKET_NAME, TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";
import { MEMEFIELDS } from '../../_shared/_db_table_details/MemeTableFields.ts';
import { Meme } from '../../_model/MemeModel.ts';
import { MEME_STATUS } from "../../_shared/_constants/Types.ts";


/* 
Function to check whether the meme exists
1. Uses Supabase to query the Meme table for the meme_id.
2. Returns the existing meme if found, otherwise returns null.
3. Throws an error if the fetch operation fails.
*/
export async function meme_exists(meme_id: string) {
    const { data: existingMeme, error: fetchError } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .select("*")
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .single();
    if (fetchError || !existingMeme) return null;
    return existingMeme;
}

/* 
Function to check whether the meme title exists
1. Uses Supabase to query the Meme table for the meme_title.
2. Returns the existing meme if found, otherwise returns null.
3. Throws an error if the fetch operation fails.
*/
export async function meme_exist_with_sametitle(meme_title: string) {
    const { data: existingMemeTitle, error: fetchError } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .select("*")
        .eq(MEMEFIELDS.MEME_TITLE, meme_title)
        .single();

    if (fetchError || !existingMemeTitle) return null;
    return existingMemeTitle.meme_title;
}


/* 
Function to check whether the user exists
1. Uses Supabase to query the User table for the user_id.
2. Returns the existing user if found, otherwise returns null.
3. Throws an error if the fetch operation fails.
*/
export async function check_user_status(user_id: string) {
    const { data: existingUser, error: fetchError } = await supabase
        .from(TABLE_NAMES.USER_TABLE)
        .select("*")
        .eq(MEMEFIELDS.USER_ID, user_id)
        .single();

    if (fetchError || !existingUser) {
        return null;
    }

    return existingUser;
}

/* 
Function to upload image into database and retrieve image url
1. Fetches the image from the given URL using fetch API.
2. Uploads the fetched image to the specified bucket in Supabase Storage.
3. Returns the public URL of the uploaded image.
4. Throws an error if any step fails.
5. The uploaded image is named with the meme title for easier identification.
*/ 
export async function uploadImageToBucket(imageUrl: string, memeTitle: string): Promise<string | null> {
    console.log("Uploading image");
    try {

        /* Step 1: Fetch all files in the "memes" folder
         * This is done to check if the image with the same URL already exists in the bucket.
         * If it does, we can return the existing URL to avoid unnecessary storage usage.
         * Otherwise we will return the new URL 
        */
        console.log("Checking if image with the same URL exists in the bucket...");
        const { data: existingFiles, error: listError } = await supabase
            .storage
            .from(BUCKET_NAME.MEMES)
            .list("memes");

        if (listError) {
            console.error("Error fetching files from bucket:", listError);
            return null;
        }
        // Check if the image URL already exists in the bucket
        for (const file of existingFiles || []) {
            const { data: publicUrlData } = supabase
                .storage
                .from(BUCKET_NAME.MEMES)
                .getPublicUrl(`memes/${file.name}`);

            if (publicUrlData?.publicUrl === imageUrl) {
                console.log("Found an image with the same URL in the bucket.");
                return publicUrlData.publicUrl; // Return the existing URL
            }
        }

        /* Step 2: Fetch and upload the new image if it doesn't exist
        * If the image URL already exists in the bucket, we don't need to upload it again.
        * Otherwise, we fetch the image, upload it to the bucket, and return the public URL.
        * This step is done to save storage space and improve performance.
        */
        console.log("Image not found in the bucket. Proceeding with upload...");
        const response = await fetch(imageUrl);
        if (!response.ok) {
            console.error("Error fetching the image:", response.statusText);
            return null;
        }
        const contentType = response.headers.get("Content-Type");
        if (!contentType?.startsWith("image/")) {
            console.error("Fetched file is not a valid image.");
            return null;
        }
        const file = await response.blob();
        const fileName = `${memeTitle}.jpg`; // Encode for safe file naming
        const filePath = `memes/${fileName}`;
         console.log("Uploading image to bucket...");

        // Upload the file to bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME.MEMES)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
            });

        console.log(uploadData);
        if (uploadError || !uploadData) {
            console.error("Error uploading image:", uploadError);
            return null;
        }

        //Get the public URL of the uploaded image
        const { data: publicData } = supabase
            .storage
            .from(BUCKET_NAME.MEMES)
            .getPublicUrl(filePath);
            console.log("Public URL data:", publicData);
        return publicData?.publicUrl || null;
    } 
    catch (error) {
        console.error("Error in uploadImageToBucket:", error);
        return null;
    }
}

/*
 Function to create Meme in database
* Checks if meme already exists with the same title 
* If it doesn't, it creates a new meme.
* Returns the created meme otherwise returns null.
*/


export async function createMemeQuery(meme: Partial<Meme>, user_id: string) {
    
    console.log("Attempting to insert meme:", meme);

    const { data, error: insertError } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .insert([{
            user_id: user_id,
            meme_title: meme.meme_title,
            image_url: meme.image_url,
            tags: meme.tags,
        }])
        .select("*")
        .single();

    return { data, insertError };
}



/*
 Function to update meme in database
* Checks if meme exists with the same meme_id
* If it does, it updates the meme.
* Returns the updated meme.
* If the meme does not exist, it returns null.
1. Uses Supabase to check if a meme with the same title exists in the database.
2. If a meme with the same title exists, it returns null.
*/
export async function updatememeQuery(meme:Partial<Meme>,meme_id:string) {
    const { data, error } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .update(meme)
        .eq(MEMEFIELDS.MEME_ID,meme_id)
        // .neq(MEMEFIELDS.MEME_TITLE, meme.meme_title)
        .eq(MEMEFIELDS.DELETED,false)
        .eq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.REJECTED)
        .select("meme_id, meme_title, tags, updated_at")
        .single();
       return{data, error}
}

/* 
Function to delete meme
1. Uses Supabase to soft delete the meme by updating the 'deleted' flag to TRUE.
2. Returns the deleted meme.
3. Returns null if the meme does not exist.
*/
export async function deleteMemeQuery(meme_id: string) {
   // Perform soft deletion by updating the 'deleted' flag to TRUE
   const { data, error } = await supabase
   .from(TABLE_NAMES.MEME_TABLE)
   .update({ deleted: true, updated_at: new Date().toISOString() })
   .eq(MEMEFIELDS.DELETED, false)
   .eq(MEMEFIELDS.MEME_ID, meme_id)
   .select("meme_id, deleted, updated_at")
   .single();
   
   return { data, error };

}

/*
 function to get all the memes
 * Uses Supabase to get all the memes that are not deleted and are ordered by creation date in descending order.
 * Returns an array of memes.
*/

export async function fetchMemes(page: number, limit: number, sort: string, tags: string | null) {
    try {
        let query = supabase
            .from("memes")
            .select("meme_id, user_id, meme_title, image_url, like_count, tags, created_at")
            .eq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.APPROVED)
            .eq(MEMEFIELDS.DELETED, false)
            .order(sort === "popular" ? "like_count" : "created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        // Add tag filter if tags are provided
        if (tags) {
            const tagArray = tags.split(',');  // Split into an array of tags
            console.log(tagArray);

            // Ensure the tags are in array format and check for matching tags in the array field
            query = query.contains("tags", tagArray);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching memes:", error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error("Unexpected error fetching memes:", err);
        return { data: null, error: err };
    }
}

/*
 function to get memes by user
 * Uses Supabase to get all the memes that belong to the specified user and are not deleted .
 * Returns meme if it exists otherwise returns null
*/

export async function getMemesByIdQuery(meme_id: string) {
    const { data, error } = await supabase
   .from(TABLE_NAMES.MEME_TABLE)
   .select("meme_title, image_url,tags, like_count,created_at")
   .eq(MEMEFIELDS.DELETED, false)
   .eq(MEMEFIELDS.MEME_ID, meme_id)
   
    return{data, error}
}


/*
 Function to update meme status
 * Uses Supabase to update the status of the meme.
 * Returns the updated meme if it exists otherwise returns null.
 */

 export async function updateMemeStatusQuery(meme_id: string, meme_status: string) {
    const { data, error } = await supabase
    .from(TABLE_NAMES.MEME_TABLE)
    .update({ meme_status: meme_status,updated_at: new Date().toISOString()})
    .eq(MEMEFIELDS.MEME_ID, meme_id)
    .select("meme_id, meme_status,meme_title")
    .single();

    return {data,error}
}
