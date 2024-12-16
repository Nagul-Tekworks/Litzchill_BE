import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { markNotificationsAsReadQuery } from "../../_repository/_notifications_repo/NotificationsQueries.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "../../_shared/_messages/NotificationMessages.ts";

/**
 * Marks a notification as read.
 * 
 * @param {Request} req - The request object containing the request details.
 * @param {Record<string, string>} params - The parameters from the URL, including the notification ID.
 * @returns {Promise<Response>} A promise that resolves to a success or error response based on the operation.
 */
export default async function markNotification(_req: Request, params: Record<string, string>): Promise<Response> {
    try {
        const notification_id = params.id;

        // Validate the notification ID
        if (!notification_id || !V4.isValid(notification_id)) {
            console.log("Validation failed: Missing parameters.");
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, NOTIFICATION_ERRORS.MISSING_ID);
        }

        // Mark the notification as read
        // Mark the notification as read
        const isSuccessful = await markNotificationsAsReadQuery(notification_id);
        if (!isSuccessful) {
            console.log("Marking failed");
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, NOTIFICATION_ERRORS.FAILED_TO_UPDATE);
        }

        // Return a success response
        return SuccessResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NOTIFICATION_UPDATED);
        
    } catch (error) {
        console.error("Error marking notification:", error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
