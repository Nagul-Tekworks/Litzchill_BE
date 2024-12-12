import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import{ ErrorResponse,SuccessResponse } from "../../_responses/Response.ts";
import { contentTypeValidations, parseTags, validateMemeData} from '../../_shared/_validation/Meme_Validations.ts';
import { createMemeQuery, meme_exist_with_sametitle, uploadImageToBucket } from "../../_repository/_meme_repo/MemeRepository.ts";
import { Meme } from "../../_model/MemeModel.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";
import { MEMEFIELDS } from '../../_shared/_db_table_details/MemeTableFields.ts';



export default async function createMeme(req: Request,user:Record<string,string>) {
    
    console.log("proccessing createMeme request");
    try {
        // if(!user)return  ErrorsResponse(HTTP_STATUS_CODE.UNAUTHORIZED,COMMON_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
        const {user_id}=user;
        console.log("User_id is: ",user_id)
        // Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) {
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
        }

        /*
         * Extract the form data from the request body 
         * Note: This assumes that the form data includes fields named "meme_title", "image_url", and "tags"
         */
        const formData = await req.formData();
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
        let image_url = formData.get(MEMEFIELDS.IMAGE_URL) as string;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = parseTags(tagsRaw);
        console.log("Extracted values:", { meme_title, image_url, tags });
        
        
        // Prepare meme data for insertion
        const meme: Partial<Meme> = { meme_title, image_url, tags };
        
        /*  
         * Validate the meme data before inserting it into the database.
         * If there are any validation errors, return the appropriate error response otherwise continue with the insertion process.
        */
        const validationResponse = await validateMemeData(meme);
        console.log("Validation response:", validationResponse)
        if (validationResponse instanceof Response) {
            return validationResponse; // If there are validation errors, return the response
        }

        //Check if a meme with the same title already exists
        // const existingMeme = await meme_exist_with_sametitle(meme_title);
        // if(existingMeme)
        // {
        //     console.log(`cheking: Meme with the same title${existingMeme} already exists`);
        //     return await ErrorResponse(HTTP_STATUS_CODE.CONFLICT,MEME_ERROR_MESSAGES.TITLE_CONFLICT)
        // }

        // Step 2: Upload the image to the bucket
        const uploadedUrl = await uploadImageToBucket(image_url, meme_title);
        if (!uploadedUrl) {
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED);
        }

         image_url = uploadedUrl
         const memeData: Partial<Meme> = { meme_title, image_url, tags };

        //Insert the meme into the database
        const { data: insertmeme, insertError } = await createMemeQuery(memeData, user_id);
        if (insertError) {
           return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);
        }

        // If no errors, insert the meme into the database
        return await SuccessResponse (MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY, insertmeme,HTTP_STATUS_CODE.CREATED);

    } catch (error) {
        console.error("Error creating meme: ", error);
        return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
        