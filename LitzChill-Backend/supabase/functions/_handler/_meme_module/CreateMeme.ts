import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import{ ErrorsResponse,SuccessResponse } from "../../_responses/Response.ts";
import { contentTypeValidations, parseTags, validateMemeData} from '../../_shared/_validation/Meme_Validations.ts';
import { MEMEFIELDS } from '../../_shared/_db_table_details/TableFields.ts';
import { createMemeQuery, meme_exist_with_sametitle, uploadImageToBucket } from "../../_repository/_meme_repo/MemeRepository.ts";
import { Meme } from "../../_model/MemeModel.ts";
import { MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/SuccessMessages.ts";
import { MEME_ERROR_MESSAGES } from "../../_shared/_messages/ValidationMessages.ts";


export default async function createMeme(req: Request) {
    console.log("proccessing createMeme request");
    try {
        // Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) {
            return await ErrorsResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
        }

        /*
         * Extract the form data and validate the required fields before inserting the meme into the database.
         * Perform any additional validations or sanitizations as needed.
         * Return appropriate response on success or failure.
         */
        const formData = await req.formData();
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
        let image_url = formData.get(MEMEFIELDS.IMAGE_URL) as string;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = parseTags(tagsRaw);
        console.log("Extracted values:", { meme_title, image_url, tags });
        
        
        // Prepare meme data for insertion
        const meme: Partial<Meme> = { meme_title, image_url, tags };

        const validationResponse = await validateMemeData(meme);
        if (validationResponse instanceof Response) {
            return validationResponse; // If there are validation errors, return the response
        }


        // Step 2: Ensure the user is a memer and has the necessary permissions
        // const existingUser = await check_user_status(user_id);
        // if (!existingUser || existingUser.user_type !== USER_ROLES.MEMER_ROLE) {
        //     return await ErrorsResponse(HTTP_STATUS_CODE.FORBIDDEN, COMMON_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
        // }

        const existingMeme = await meme_exist_with_sametitle(meme_title);
        if(!existingMeme)
        {
            return await ErrorsResponse(HTTP_STATUS_CODE.CONFLICT,MEME_ERROR_MESSAGES.TITLE_CONFLICT)
        }

        // Step 2: Upload image or reuse existing URL
        const uploadedUrl = await uploadImageToBucket(image_url, meme_title);
        if (!uploadedUrl) {
            return await ErrorsResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED);
        }

        // Set the uploaded image URL
        image_url = uploadedUrl; 


        // Step 3: Insert the meme into the database
        const insertmeme = await createMemeQuery(meme);
        if (!insertmeme) {
            return await ErrorsResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);
        }
 
        return await SuccessResponse(HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY,insertmeme);

    } catch (error) {
        console.error("Error creating meme: ", error);
        return await ErrorsResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
        