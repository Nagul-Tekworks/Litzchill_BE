
export default async function markNotification(req: Request) {
    try {
        // Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) {
            return await RESPONSE(HTTPSTATUSCODE.BAD_REQUEST,ERRORMESSAGE.INVALIDCONTENTTYPE);
        }

        /*
         * Extract the form data and validate the required fields before inserting the meme into the database.
         * Perform any additional validations or sanitizations as needed.
         * Return appropriate response on success or failure.
         */
        const formData = await req.formData();
        const notification_id = formData.get("notification_id") as string;

        if (!notification_id) {
            console.log("Validation failed: Missing parameters.");
            return await RESPONSE(HTTPSTATUSCODE.BAD_REQUEST,ERRORMESSAGE.MISSINGPARAMETERS);
        }

        const existingNotifications = await existingNotificationsQuery(notification_id);
        if (existingNotifications.read_status === true) {
            return RESPONSE(HTTPSTATUSCODE.CONFLICT,ERRORMESSAGE.OPERATIONALREADYDONE)
        }

        const markNotification = await markNotificationsAsReadQuery(notification_id);
        if (!markNotification) {
            console.log("Marking failed");
            return RESPONSE(HTTPSTATUSCODE.FAILED,ERRORMESSAGE.FAILED)
         }

         // Return the updated meme
         return RESPONSE(HTTPSTATUSCODE.OK,SUCCESSMESSAGE.OK)
 
     }
     catch (error) {
         console.error("Error updating meme:", error);
         return RESPONSE(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,ERRORMESSAGE.INTERNAL_SERVER_ERROR)
     }
}