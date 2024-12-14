import { deleteMemeQuery } from "../../_repository/_meme_repo/MemeRepository.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";

export default async function DeletememebyID(req: Request,params:Record<string,string>) {
    try {
        const meme_id = params.id;
        // Validate meme_id
        if (!meme_id || !V4.isValid(meme_id)) { 
            console.log("Validation failed: Missing parameters.");
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

        // Delete the meme 
        const {error} = await deleteMemeQuery(meme_id);
        if(error){
                console.log("delete failed");
                return await ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.FAILED_TO_DELETE)
            }

            // Return the updated meme
            return await SuccessResponse(MEME_SUCCESS_MESSAGES.MEME_DELETED_SUCCESSFULLY,HTTP_STATUS_CODE.NO_CONTENT);
    
    
        } catch (error) {
            console.error("Error updating meme:", error);
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    }

