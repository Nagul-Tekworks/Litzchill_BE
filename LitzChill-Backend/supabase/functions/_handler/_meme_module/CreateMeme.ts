import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import {  contentTypeValidations, parseTags, validateMemeData } from '../../_shared/_validation/Meme_Validations.ts';
import { createMemeQuery, uploadFileToBucket } from "../../_repository/_meme_repo/MemeRepository.ts";
import { Meme } from "../../_model/MemeModel.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";
import { MEMEFIELDS } from '../../_shared/_db_table_details/MemeTableFields.ts';

 
 
/**
 * Handler function to create a new meme.
 *
 * This function handles the creation of a meme by:
 * - Verifying the content type of the incoming request to ensure it's multipart/form-data.
 * - Extracting necessary form data including meme_title, image_url (file), and tags.
 * - Validating the meme data before inserting it into the database.
 * - Uploading the meme's image to a cloud storage bucket.
 * - Inserting the meme into the database.
 *
 * @param {Request} req - The HTTP request object that contains the data for the new meme.
 * @param {Record<string, string>} user - The user data, expected to have a user_id field.
 *
 * @returns {Promise<Response>} - The response containing the status of the operation:
 *   - If successful, a success response with the created meme data.
 *   - If any step fails, an error response with an appropriate status code and message.
 *
 * @throws {Error} Throws an error if any part of the process fails unexpectedly.
 */
export default async function createMeme(req: Request, user: Record<string, string>): Promise<Response> {
    console.log("Processing createMeme handler");
 
    try {
        const { user_id } = user;
        console.log("User_id is: ", user_id);
 
        // Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) {
            return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
        }
 
        // Extract the form data from the request body
        const formData = await req.formData();
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = parseTags(tagsRaw);
        const media_file = formData.get(MEMEFIELDS.MEDIA_FILE) as File;
 
        console.log("Extracted values:", { meme_title, tags,media_file});
 
        // Validate the meme data before inserting it into the database
        const validationResponse =  validateMemeData(false,meme_title,tags,media_file);
        console.log("Validation response:", validationResponse);
        console.log("Type is: ",typeof validationResponse)  ;


        
        if (Array.isArray(validationResponse)) {
            console.log("returning:", validationResponse.join(", "));
            return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,validationResponse.join(", ")); // If there are validation errors, return the response
        }
 
        // Step 2: Upload the image to the bucket and get the public URL
        const uploadedUrl = await uploadFileToBucket(media_file, meme_title);
        if (!uploadedUrl) {
            return  ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.MEDIA_UPLOAD_FAILED);
        }
 
       
        // Prepare meme data for insertion
        const meme: Partial<Meme> = { meme_title, tags, media_file: uploadedUrl,user_id};
       
 
        // Insert the meme into the database
        const { data: insertmeme, error:insertError } = await createMemeQuery(meme);
        if (insertError) {
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);
        }
 
        // Return success response
        return await SuccessResponse(HTTP_STATUS_CODE.CREATED, MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY, insertmeme);
 
    } catch (error) {
        console.error("Error creating meme:", error);
        return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}