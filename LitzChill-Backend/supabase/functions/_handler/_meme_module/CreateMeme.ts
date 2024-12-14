import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { contentTypeValidations, parseTags, validateMemeData } from '../../_shared/_validation/Meme_Validations.ts';
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
    console.log("Processing createMeme request");

    try {
        const { user_id } = user;
        console.log("User_id is: ", user_id);

        // Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        console.log("Received content-type:", contentType); // Log the content type received
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) {
            console.log("Invalid content type received, returning error.");
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
        }

        // Extract the form data from the request body
        const formData = await req.formData();
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = parseTags(tagsRaw);
        const media_file = formData.get(MEMEFIELDS.MEDIA_FILE) as File; // Get the file from the form data

        if (!media_file) {
            console.log("No media file provided, returning error.");
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, "Image file is required.");
        }

        console.log("Extracted values:", { meme_title, tags, media_file });

        // Prepare meme data for insertion
        const meme: Partial<Meme> = { meme_title, tags };

        // Validate the meme data before inserting it into the database
        // const validationResponse = await validateMemeData(meme);
        // console.log("Validation response:", validationResponse);
        // if (validationResponse instanceof Response) {
        //     console.log("Validation failed, returning response.");
        //     return validationResponse; // If there are validation errors, return the response
        // }

        // Step 2: Upload the image to the bucket and get the public URL
        console.log("Uploading image to bucket...");
        const uploadedUrl = await uploadFileToBucket(media_file, meme_title);
        if (!uploadedUrl) {
            console.log("Image upload failed, returning error.");
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED);
        }

        console.log("Image uploaded successfully, URL:", uploadedUrl);
        // Set the image_url to the URL returned from the cloud storage
        meme.media_file = uploadedUrl;

        // Insert the meme into the database
        console.log("Inserting meme into the database...");
        const { data: insertmeme, error: insertError } = await createMemeQuery(meme, user_id);
        if (insertError) {
            console.log("Error inserting meme into database:", insertError);
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);
        }

        console.log("Meme created successfully:", insertmeme);
        // Return success response
        return await SuccessResponse(HTTP_STATUS_CODE.CREATED, MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY, insertmeme);

    } catch (error) {
        console.error("Error creating meme:", error);
        return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
