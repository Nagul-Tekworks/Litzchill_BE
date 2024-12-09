import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import {ErrorResponse} from "../../_responses/Response.ts";
import { SuccessResponse } from "../../_responses/Response.ts";


export default async function createMeme(req: Request) {
    console.log("proccessing createMeme request");
    try {
        // Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentType(contentType);
        if (!validateContentType) {
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
        }

        /*
         * Extract the form data and validate the required fields before inserting the meme into the database.
         * Perform any additional validations or sanitizations as needed.
         * Return appropriate response on success or failure.
         */
        const formData = await req.formData();
        const user_id = formData.get(MEMEFIELDS.USER_ID) as string;
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
        let image_url = formData.get(MEMEFIELDS.IMAGE_URL) as string;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = parseTags(tagsRaw);
        console.log("Extracted values:", { user_id, meme_title, image_url, tags });
        
        // Validate required parameters
        console.log(user_id,meme_title,image_url,tags);
        if ( !user_id || !meme_title || !image_url || !Array.isArray(tags) || tags.length === 0) {
            console.log("Validation failed: Missing parameters.");
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.);
        }
        
        // Validate meme title 
        const validatedMemetitle = validateMemeTitle(meme_title);
        if(!validatedMemetitle){
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.MEME_TITLE_EXCEEDS_LIMIT);
        }

        // Validate each tag's
        const validatedTagFields = validateTags(tags)
        if(!validatedTagFields){
                return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.INVALID_TAG);
        }

        // Step 2: Ensure the user is a memer and has the necessary permissions
        const existingUser = await check_user_status(user_id);
        if (!existingUser || existingUser.user_type !== ROLES.MEMER) {
            return await ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN,COMMON_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
        }

        // Step 3: Upload image or reuse existing URL
        const uploadedUrl = await uploadImageToBucket(image_url,meme_title);
        if (!uploadedUrl) {
            return await ErrorResponse(HTTP_STATUS_CODE.,COMMON_ERROR_MESSAGES.); 
        }
         // Set the uploaded image URL
        image_url = uploadedUrl;
       
        const meme:Partial<Meme> = {user_id,meme_title,image_url,tags};

        // Step 4: Insert the meme into the database
        const insertmeme = await createMemeQuery(meme);
        if (!insertmeme) {
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.FAILED);
        }
        return await SuccessResponse(HTTP_STATUS_CODE.OK, COMMO.CREATE_SUCCESS);
    } catch (error) {
        console.error("Error creating meme: ", error);
        return await ErrorResponse(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,ERRORMESSAGE.INTERNAL_SERVER_ERROR);
    }
}
