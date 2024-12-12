//comment Module All Error Messages
export const COMMENT_MODULE_ERROR_MESSAGES = {
    CONTENT_NOT_FOUND: "Content not found with this ID. Please ensure the content exists.",
    FAILED_TO_ADD_COMMENT: "Failed to add your comment due to an internal error.",
    COMMENT_NOT_FOUND: "No comment found with the provided ID. Verify the ID and try again.",
    COMMENT_NOT_DELETED:"Comment Not Deleted Due To Some Error"
};



//commentModule All Success messages
export const COMMENT_MODULE_SUCCESS_MESSAGES={

    COMMENT_ADDED: "Your comment has been added successfully!",
    COMMENT_DELETED: "The comment has been deleted successfully!"
 
 }


 //comment Module Validation Messages
export const COMMENT_VALIDATION_MESSAGES ={
        
    MISSING_COMMENT_ID:"Please Provide Comment Id",
    INVALID_COMMENT_ID: "Invalid Comment ID. Ensure you're using a valid UUID format.",
    MISSING_CONTENT_TYPE:"Provide contentType To add Comment",
    INVALID_CONTENT_TYPE:"Provide Valid contentType Only (Meme Or Comment) Allowed",
    MISSING_CONTENT_ID:"Provide contentId To Add Comment",
    INAVLID_CONTENT_ID:"Inavlid contentId Please Provide Valid Content Id",
    MISSING_COMMENT_MESSAGE:"Please Provide Comment Message"
}