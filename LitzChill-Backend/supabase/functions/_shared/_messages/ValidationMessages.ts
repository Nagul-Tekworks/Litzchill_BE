
export const MEME_ERROR_MESSAGES = {
    //missing fields
    MISSING_USER_ID: "User ID is required to create a meme.",
    MISSING_MEME_TITLE: "Meme title is required.",
    MISSING_IMAGE_URL: "Image URL is required.",
    MISSING_TAGS: "At least one tag is required for the meme.",
    MISSING_MEMEID: "Meme-id parameter is Misiing or Invalid",

    //validating fields
    MEME_TITLE_EXCEEDS_LIMIT: "Meme title exceeds the allowed character limit (3-100 characters).",
    INVALID_MEME_TITLE: "Meme title contains invalid characters. Only letters, numbers, and basic punctuation are allowed.",
    INVALID_TAG_LENGTH: "Tags must be between 1 and 15 characters in length.",
    INVALID_TAG: "One or more tags are invalid. Tags can only contain letters, numbers, and hyphens.",

    //restricted 
    NO_PERMISSION_TO_MODIFY:"You do not have permission to modify the meme_id field.",

    //failed errors
    IMAGE_UPLOAD_FAILED: "Failed to upload the image. Please try again.",
    FAILED_TO_CREATE: "An error occurred while creating the meme. Please try again later.",
    FAILED_TO_UPDATE: "An error occurred while updating the meme. Please try again later.",
    FAILED_TO_FETCH: "An error occurred while fetching the meme. Please try again later.",
    FAILED_TO_DELETE: "An error occurred while deleting the meme. Please try again later.",

    //Meme Already exists
    TITLE_CONFLICT:"A meme is already existed with same title",

    //Meme Not Found
    MEME_NOT_FOUND:"Meme the given id is not found "
};
