import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { contentTypeValidations, parseTags, validateMemeData } from "../../_shared/_validation/Meme_Validations.ts";
import { MEMEFIELDS } from '../../_shared/_db_table_details/MemeTableFields.ts';
import { updatememeQuery } from "../../_repository/_meme_repo/MemeRepository.ts";
import { Meme } from '../../_model/MemeModel.ts';
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";


export default async function updateMeme(req: Request,params:Record<string,string>) {
    try {
        const meme_id = params.id;
        
        // Validate the meme_id parameter
        if (!meme_id || !V4.isValid(meme_id)) { 
            console.log("Validation failed: Missing parameters.");
            return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

  
        //Extract the form data and validate the required fields before inserting the meme into the database.
        const formData = await req.formData();
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string |null;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = tagsRaw ? parseTags(tagsRaw) : undefined; 
        console.log("Extracted values:", { meme_title,tags });
        

        // Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) {
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
        }


        const meme: Partial<Meme> = {};
        if (meme_title !== null && meme_title.trim() !== "") {
            meme.meme_title = meme_title; // Add title only if provided
        }
        if (tags !== undefined) {
            meme.tags = tags; // Add tags only if provided
        }
        
        const validationResponse = await validateMemeData(meme,true);
        if (validationResponse instanceof Response) {
            return validationResponse; // If there are validation errors, return the response
        }


        // Perform the update
        const {data:updatememe,error} = await updatememeQuery(meme,meme_id);
        if(error || updateMeme.length===0)
        {
            console.log("Update failed");
            return await ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
        }
        // Return the updated meme
        return await SuccessResponse(MEME_SUCCESS_MESSAGES.MEME_UPDATED_SUCCESSFULLY,updatememe);


    } catch (error) {
        console.error("Error updating meme:", error);
        return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
