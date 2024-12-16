import supabase from "../../_shared/_config/DbConfig.ts";
import { BUCKET_NAME, TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";
import { MEMEFIELDS } from '../../_shared/_db_table_details/MemeTableFields.ts';
import { Meme } from '../../_model/MemeModel.ts';
import { USER_ROLES } from "../../_shared/_constants/UserRoles.ts";
import { MEME_STATUS } from '../../_shared/_constants/Types.ts';

/**
 * Checks if a meme exists in the database with the given criteria.
 * 
 * @param {string} meme_id - The unique identifier of the meme instance.
 * @returns {object | null} - The existing meme object if found; otherwise, null.
 */
export async function meme_exists(meme_id: string) {
    // Check if meme exists and ensure it's not deleted
    const { data: existingMeme, error: fetchError } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .select("*")
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
        .maybeSingle();  // Ensure only one row is returned

    if (fetchError || !existingMeme) {
        console.error(`Error fetching meme with ID ${meme_id}: ${fetchError}`);
        return null;
    }

    return existingMeme;
}


/**
 * Checks the status of a user in the database.
 * 
 * @param {string} user_id - The unique identifier of the user.
 * @returns {Promise<object | null>} - The user object if found; otherwise, null.
 */
export async function check_user_status(user_id: string): Promise<object | null> {
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


/**
 * Uploads a file (image or video) to the specified bucket.
 * 
 * @param {File} mediaFile - The file object to be uploaded.
 * @param {string} memeTitle - The title of the meme associated with the file.
 * @returns {Promise<string | null>} - The public URL of the uploaded file, if successful; otherwise, null.
 */

export async function uploadFileToBucket(mediaFile: File, memeTitle: string): Promise<string | null> {
    console.log("Uploading media file");

    try {
        // Supported MIME types for images and videos
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/avi", "video/mpeg"];
        // Validate the file type
        if (!allowedTypes.includes(mediaFile.type)) {
            console.error("Unsupported file type:", mediaFile.type);
            return null;
        }
        // Generate a hash of the file content
        const fileHash = await generateFileHash(mediaFile);
        console.log("Generated file hash:", fileHash);

        // Check if the file with the same hash already exists
        const { data: existingFiles, error: listError } = await supabase
        .storage
        .from(BUCKET_NAME.MEMES)
        .list("memes");

        if (listError) {
            console.error("Error fetching files from bucket:", listError);
            return null;
        }

        const existingFile = existingFiles?.find(file => file.name.includes(fileHash));
        if (existingFile) {
            const { data: publicUrlData } = supabase
                .storage
                .from(BUCKET_NAME.MEMES)
                .getPublicUrl(existingFile.name);

            console.log("Found an existing file with the same content.");
            return publicUrlData?.publicUrl || null; // Return the existing file's URL
        }

        // Upload the new file
        console.log("File not found in the bucket. Proceeding with upload...");
        const extension = mediaFile.name.split('.').pop()?.toLowerCase() || "";
        const sanitizedFileName = `${memeTitle.replace(/\s+/g, "_")}-${fileHash}.${extension}`;
        const filePath = `memes/${sanitizedFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME.MEMES)
            .upload(filePath, mediaFile, {
                cacheControl: "3600",
                upsert: false,
                contentType: mediaFile.type, // Preserve file's MIME type
            });

        if (uploadError || !uploadData) {
            console.error("Error uploading file:", uploadError);
            return null;
        }

        console.log("File uploaded successfully.");

        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabase
            .storage
            .from(BUCKET_NAME.MEMES)
            .getPublicUrl(filePath);

        console.log("Public URL data:", publicUrlData);
        return publicUrlData?.publicUrl || null;

    } catch (error) {
        console.error("Error in uploadFileToBucket:", error);
        return null;
    }
}

// Helper function to generate the SHA-256 hash of a file
async function generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer); // Generate hash using SHA-256
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join(""); // Convert byte array to hex string
    return hashHex;
}


/**
 * Inserts a new meme into the database.
 * 
 * @param {Partial<Meme>} meme - The meme object containing the title, image URL, and tags.
 * @param {string} user_id - The unique identifier of the user creating the meme.
 * @returns {Promise<{ data: object | null, error: object | null }>} - The inserted meme data if successful; otherwise, an error.
 */
export async function createMemeQuery(meme: Partial<Meme>): Promise<{ data: object | null, error: object | null }> {
    
    console.log("Attempting to insert meme:", meme);

    const { data, error } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .insert([{
            user_id: meme.user_id,
            meme_title: meme.meme_title,
            image_url: meme.media_file,
            tags: meme.tags,
        }])
        .select("*")
        .single();

    return { data, error };
}



/**
 * Updates an existing meme in the database.
 * 
 * The function checks if a meme with the given `meme_id` exists and updates it with the provided data.
 * If the meme doesn't exist or the conditions (e.g., deleted or rejected status) are not met, it returns null.
 * 
 * @param {Partial<Meme>} meme - The partial meme object containing the fields to update (e.g., title, tags, etc.).
 * @param {string} meme_id - The unique identifier of the meme to be updated.
 * @returns {Promise<{ data: object | null, error: object | null }>} - A promise that resolves with the updated meme data or an error.
 */
export async function updatememeQuery(meme: Partial<Meme>, user_type: string): Promise<{ data: object | null, error: object | null }> {
    // Check if the user is an admin or the owner of the meme
    if (user_type === USER_ROLES.ADMIN_ROLE) {
        console.log("Admin role: Admin can update any meme");

        // Admin can update any meme
        const { data, error } = await supabase
            .from(TABLE_NAMES.MEME_TABLE)
            .update(meme)
            .eq(MEMEFIELDS.MEME_ID, meme.meme_id) // Match the meme ID
            .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED) // Ensure meme isn't already deleted
            .select("meme_id, meme_title, tags, updated_at")
            .single();
        
        return { data, error };
    } 
    else if (user_type === USER_ROLES.MEMER_ROLE) {
        console.log("Memer role: Memer can only update their own meme");

        // Memer can only update their own meme
        const { data, error } = await supabase
            .from(TABLE_NAMES.MEME_TABLE)
            .update(meme)
            .eq(MEMEFIELDS.MEME_ID, meme.meme_id) // Match the meme ID
            .eq(MEMEFIELDS.USER_ID, meme.user_id) // Match the user ID (owner check)
            .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED) // Ensure meme isn't deleted
            .select("meme_id, meme_title, tags, updated_at")
            .single();

        return { data, error };
    } 

    // Unauthorized access if user type is invalid
    return { data: null, error: { message: "Unauthorized access: Invalid user type" } };
}


/**
 * Soft delete a meme by updating its status to "deleted".
 * Ensures that the user_id matches if the role is not admin.
 * 
 * @param {string} meme_id - The ID of the meme to delete.
 * @param {string} user_id - The ID of the user attempting to delete.
 * @param {string} role - The role of the user (e.g., admin, memer).
 * 
 * @returns {Promise<{ data: object | null, error: object | null }>} - The result of the query.
 */
export async function deleteMemeQuery(meme_id: string, user_id: string, user_type: string) {
    if (user_type === USER_ROLES.ADMIN_ROLE) {
        console.log("Admin role")

        // Admin can delete any meme
        const { data, error } = await supabase
            .from(TABLE_NAMES.MEME_TABLE)
            .update({ meme_status: MEME_STATUS.DELETED }) // Update meme_status to "deleted"
            .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
            .eq(MEMEFIELDS.MEME_ID, meme_id) // Match the meme ID
            .select("meme_id, meme_status")
            .single();

        return { data, error };
    } 
    else if (user_type === USER_ROLES.MEMER_ROLE) {
        console.log("memer")

        // Memer can only delete their own meme
        const { data, error } = await supabase
            .from(TABLE_NAMES.MEME_TABLE)
            .update({ meme_status: MEME_STATUS.DELETED }) // Update meme_status to "deleted"
            .eq(MEMEFIELDS.MEME_ID, meme_id) // Match the meme ID
            .eq(MEMEFIELDS.USER_ID, user_id) // Match the user ID
            .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
            .select("meme_id, meme_status")
            .single();
            
        return { data, error };
    }
    return { data: null, error: { message: "Unauthorized" } }; // In case of an invalid role
 }
 

 /**
  * Fetches memes that are not deleted and optionally filters them by tags.
  * The memes are ordered by creation date or popularity (based on the `sort` parameter).
  * 
  * @param {number} page - The current page number for pagination.
  * @param {number} limit - The number of memes to fetch per page.
  * @param {string} sort - The sorting order. Can be 'popular' or 'created_at'.
  * @param {string | null} tags - A comma-separated string of tags to filter memes by, or null for no tag filter.
  * @returns {Promise<{ data: object[] | null, error: object | null }>} - A promise that resolves with an array of memes or an error.
  */
export async function fetchMemes(page: number, limit: number, sort: string, tags: string | null): Promise<{ data: object[] | null, error: object | null }> {
        let query = supabase
            .from("memes")
            .select("meme_id, user_id, meme_title, image_url, like_count, tags, created_at")
            .eq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.APPROVED)
            .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
            .order(sort === "popular" ? "like_count" : "created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (tags) {
            const tagArray = tags.split(",").map(tag => tag.trim()); // Split and trim tags
            query = query.contains("tags", JSON.stringify(tagArray)); // Use JSON.stringify for JSON columns
        }
    
        const { data, error } = await query;

        if (error) {
            console.error("Error fetching memes:", error);
            return { data: null, error };
        }

        return { data, error: null };
}

/**
 * Fetches a meme by its ID.
 * 
 * @param {string} meme_id - The unique identifier of the meme.
 * @returns {{ data: object | null, error: object | null }} - The meme data for given ID or an error object.
 */
export async function getMemesByIdQuery(meme_id: string){
    const { data, error } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .select("meme_title, image_url, tags, like_count, created_at")
        .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
        .eq(MEMEFIELDS.MEME_ID, meme_id);
   
    return { data, error };
}

/**
 * Updates the status of a meme.
 * 
 * @param {string} meme_id - The unique identifier of the meme.
 * @param {string} meme_status - The new status of the meme.
 * @returns {{ data: object | null, error: object | null }} - The updated meme data or an error object.
 */
export async function updateMemeStatusQuery(
    meme_id: string, 
    meme_status: string
) {
    const { data, error } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .update({ meme_status: meme_status})
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
        .select("meme_id, meme_status, meme_title")
        .single();

    return { data, error };
}
