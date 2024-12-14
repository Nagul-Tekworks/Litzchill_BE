 
/**
 * Uploads a file (image or video) to the specified bucket.
 *
 * @param {File} mediaFile - The file object to be uploaded.
 * @param {string} memeTitle - The title of the meme associated with the file.
 * @returns {Promise<string | null>} - The public URL of the uploaded file, if successful; otherwise, null.
 */

import { Meme } from "../../_model/MemeModel.ts";
import supabase from "../../_shared/_config/DbConfig.ts";
import { BUCKET_NAME, TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";

 
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
export async function createMemeQuery(meme: Partial<Meme>, user_id: string): Promise<{ data: object | null, error: object | null }> {
   
    console.log("Attempting to insert meme:", meme);
 
    const { data, error } = await supabase
        .from(TABLE_NAMES.MEME_TABLE)
        .insert([{
            user_id: user_id,
            meme_title: meme.meme_title,
            image_url: meme.media_file,
            tags: meme.tags,
        }])
        .select();
 
    return { data, error };
}

 
 