import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { updateMemeStatusQuery } from "../../_repository/_meme_repo/MemeRepository.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { MEMEFIELDS } from "../../_shared/_db_table_details/TableFields.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";
import { contentTypeValidations } from "../../_shared/_validation/Meme_Validations.ts";
import {MEME_STATUS, NOTIFICATION_TYPES} from "../../_shared/constants/Meme_Status.ts";
import { addNotifications } from "../../_repository/_notifications_repo/NotificationsQueries.ts";


export default async function updateMemeStatus(req: Request,user:Record<string,string>) {
  try {
    const {id} = user;
    const meme_id = id;
    
    // Validate the meme_id parameter
    if (!meme_id || !V4.isValid(meme_id)) { 
        console.log("Validation failed: Missing parameters.");
        return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,MEME_ERROR_MESSAGES.MISSING_MEMEID);
    }


    //Extract the form data and validate the required fields before inserting the meme into the database.
    const formData = await req.formData();
    const meme_status = formData.get(MEMEFIELDS.MEME_STATUS) as string;
     // Ensure the content type is multipart/form-data
     const contentType = req.headers.get("content-type") || "";
     const validateContentType = contentTypeValidations(contentType);
     if (!validateContentType) {
         return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
     }

    
    // Step 3: Validate status value
    const validStatuses = [MEME_STATUS.APPROVED, MEME_STATUS.PENDING, MEME_STATUS.REJECTED];
    if (!validStatuses.includes(meme_status)) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,MEME_ERROR_MESSAGES.)
    }

    // Step 4: Update meme status
    const updatedmemestatus = await updateMemeStatusQuery(meme_id,meme_status);
    if (!updatedmemestatus) {
        console.log("Failed to update meme status")
      return ErrorResponse(HTTP_STATUS_CODE.FAILED,MEME_ERROR_MESSAGES.FAILED)
    }

    // Step 5: Notify user about the change in status
    const type = NOTIFICATION_TYPES.ENGAGEMENT;
    const notify = await addNotifications(user_id,existingMeme.meme_title,type);
    if (!notify){
       console.error("Failed to notify meme owner");
    }

    return SuccessResponse(HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_STATUS_UPDATED_SUCCESSFULLY)

    } catch (error) {
        console.error("Error updating meme:", error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,ERRORMESSAGE.INTERNAL_SERVER_ERROR)
    }
}
