import { getNotificationsQuery } from "../../_repository/_notifications_repo/NotificationsQueries.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "../../_shared/_messages/NotificationMessages.ts";
/**
 * Fetches notifications for a user.
 * 
 * @param {Request} req - The request object, containing the necessary parameters and headers.
 * @param {Record<string, string>} params - The route parameters, including the user_id of the requesting user.
 * @returns {Promise<Response>} - A promise that resolves with the appropriate response object: success or error.
 */
export default async function getNotifications(req: Request, params: Record<string, string>): Promise<Response> {
    try {
        const user_id = params.user_id;
        // Fetch notifications for the user
        const { data: notifications, error } = await getNotificationsQuery(user_id);

        if (error) {
            console.log("Fetching failed");
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, NOTIFICATION_ERRORS.FAILED_TO_FETCH);
        }

        if (!notifications || notifications.length === 0) {
            return ErrorResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NO_NOTIFICATIONS);
        }

        return SuccessResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NOTIFICATIONS_FETCHED, notifications);
    } catch (error) {
        console.error("Error updating meme:", error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
