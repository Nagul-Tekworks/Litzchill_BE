import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { updateMemeStatusQuery } from "../../_repository/_meme_repo/MemeRepository.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";
import { contentTypeValidations } from "../../_shared/_validation/Meme_Validations.ts";
import { addNotifications } from "../../_repository/_notifications_repo/NotificationsQueries.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { MEMEFIELDS } from "../../_shared/_db_table_details/MemeTableFields.ts";
import { MEME_STATUS, NOTIFICATION_TYPES } from "../../_shared/_constants/Types.ts";

export default async function updateMemeStatus(req: Request, params: Record<string, string>) {
  try {

    const meme_id= params.id;
    const user_id = params.user_id;

    console.log(`meme_id: ${meme_id}, user_id: ${user_id}`);

    // Validate the meme_id parameter
    if (!meme_id || !V4.isValid(meme_id)) {
      console.log("Validation failed: Invalid or missing meme_id.");
      return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    }

    // Validate the content type
    const contentType = req.headers.get("content-type") || "";
    if (!contentTypeValidations(contentType)) {
      return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, COMMON_ERROR_MESSAGES.INVALIDCONTENTTYPE);
    }

    // Extract form data and validate meme_status field
    const formData = await req.formData();
    const meme_status = formData.get(MEMEFIELDS.MEME_STATUS) as string;

    if (!meme_status) {
      return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_STATUS_VALUE);
    }

    // Validate meme_status value
    const validStatuses = [MEME_STATUS.APPROVED, MEME_STATUS.PENDING, MEME_STATUS.REJECTED];
    if (!validStatuses.includes(meme_status)) {
      return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, COMMON_ERROR_MESSAGES.INVALID_DATA);
    }

    // Update meme status in the database
    const { data: updatedMemeStatus, error } = await updateMemeStatusQuery(meme_id,meme_status);
    if (error || !updatedMemeStatus ) {
      console.log("Failed to update meme status.");
      return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
    }

    // Notify user about the status update
    const type = NOTIFICATION_TYPES.ENGAGEMENT;
    const notify = await addNotifications(user_id,updatedMemeStatus.meme_title, type,meme_status);
    if (!notify) {
      console.error("Failed to notify meme owner.");
    }
   console.log(updatedMemeStatus+" updated meme status successfully");
    return SuccessResponse(
      HTTP_STATUS_CODE.OK,
      MEME_SUCCESS_MESSAGES.MEME_STATUS_UPDATED_SUCCESSFULLY
    );
  } catch (error) {
    console.error("Error updating meme status:", error);
    return ErrorResponse(
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    );
  }
}
