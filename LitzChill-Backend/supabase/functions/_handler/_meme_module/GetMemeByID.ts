import { getMemesByIdQuery } from "../../_repository/_meme_repo/MemeRepository.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";



export default async function getmemebyID(req:Request,params:Record<string,string>) {
    try {  
         const meme_id = params.id;
        // Validate the meme_id
        if (!meme_id || !V4.isValid(meme_id)) { 
            console.log("Validation failed: Missing parameters.");
            return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }
         // Perform the update
         const {data:fetchMeme,error} = await getMemesByIdQuery(meme_id);
         if(error || fetchMeme?.length===0)
         {
             console.log("Fetching failed");
             return  ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.FAILED_TO_FETCH);

         }
         // Return the updated meme
         return  SuccessResponse(HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_FETCHED_SUCCESSFULLY,fetchMeme);
        
        } catch (error) {
            console.error("Error updating meme:", error);
            return  ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }