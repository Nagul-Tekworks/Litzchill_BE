


export default async function likememe(req: Request) {
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
        const meme_id = formData.get(MEMEFIELDS.MEME_ID) as string;
        const user_id = formData.get(MEMEFIELDS.USER_ID) as string;

        if (!meme_id || !user_id) {
            console.log("Validation failed: Missing parameters.");
            return await RESPONSE(HTTPSTATUSCODE.BAD_REQUEST,ERRORMESSAGE.MISSINGPARAMETERS);
        }
       
        const existingMeme = await meme_exists(meme_id);
        if (!existingMeme) {
            console.log("meme not found")
            return RESPONSE(HTTPSTATUSCODE.NOT_FOUND,ERRORMESSAGE.NOT_FOUND)
        }

        // Check if user is authorized to update the meme
        const existingUser = await check_user_status(user_id);
        if (!existingUser) {
            return RESPONSE(HTTPSTATUSCODE.NOT_FOUND,ERRORMESSAGE.NOT_FOUND)
        }
        if (existingUser.user_type !== 'M'  &&  existingUser.user_type !=='A' ) {
          return RESPONSE(HTTPSTATUSCODE.FORBIDDEN,ERRORMESSAGE.UNAUTHORIZED)
        }

        // Check if the user has already liked the meme
        const liked = await checkLikeExists(meme_id, user_id);
        if (liked) {
            return RESPONSE(HTTPSTATUSCODE.CONFLICT,ERRORMESSAGE.OPERATIONALREADYDONE)
        }

        // Insert a new like record
        const likememe = await insertLikeQuery(meme_id, user_id);
        if (!likememe) {
          console.log("failed to like meme")
          return RESPONSE(HTTPSTATUSCODE.FAILED,ERRORMESSAGE.FAILED)
        }

        // Increment the like count in the memes table
        const likecount = await updateLikeCount(meme_id,existingMeme.like_count + 1);
        if (!likecount) {
            return RESPONSE(HTTPSTATUSCODE.FAILED,ERRORMESSAGE.FAILED)
        }
  
        // Notify the meme owner that a new like has been added
        const type = NOTIFICATION_TYPES.LIKE;
        const notify = await addNotifications(user_id,existingMeme.meme_title,type);
        if (!notify) {
            console.error("Failed to notify meme owner");
        }
        return RESPONSE(HTTPSTATUSCODE.OK,SUCCESSMESSAGE.OK)
    } 
    catch (error) {
        console.error("Error updating meme:", error);
        return RESPONSE(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,ERRORMESSAGE.INTERNAL_SERVER_ERROR)
    }
}
