


export default async function getNotifications(req:Request)
{
    try{
    
         // Ensure the content type is multipart/form-data
         const contentType = req.headers.get("content-type") || "";
         const validateContentType = contentTypeValidations(contentType);
         if (!validateContentType) {
             return await RESPONSE(
                 HTTPSTATUSCODE.BAD_REQUEST,
                 ERRORMESSAGE.INVALIDCONTENTTYPE,
             );
         }

        const formData = await req.formData();
        const user_id = formData.get(MEMEFIELDS.USER_ID) as string;
    
         // Check if user is authorized to update the meme
         const existingUser = await check_user_status(user_id);
         if (!existingUser) {
             return RESPONSE(HTTPSTATUSCODE.NOT_FOUND,ERRORMESSAGE.NOT_FOUND)
         }
         if (existingUser.user_type !== ROLES.ADMIN  &&  existingUser.user_type !==ROLES.MEMER ) {
           //  return { status: 403, message: "User not authorized to update this meme." };
           return RESPONSE(HTTPSTATUSCODE.FORBIDDEN,ERRORMESSAGE.UNAUTHORIZED)
         }

        // Fetch notifications for the user
         const notifications = await getNotificationsQuery(user_id);

        if (!notifications){
           console.log("Fetching failed");
           return RESPONSE(HTTPSTATUSCODE.FAILED,ERRORMESSAGE.FAILED)
        }
        if (notifications.length > 0) {
            return RESPONSE(HTTPSTATUSCODE.OK,SUCCESSMESSAGE.NOMEMES)
        }

        return RESPONSE(HTTPSTATUSCODE.OK,ERRORMESSAGE.NOT_FOUND)
    }
    catch (error) {
            console.error("Error updating meme:", error);
            return RESPONSE(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,ERRORMESSAGE.INTERNAL_SERVER_ERROR)
        }
     }

     