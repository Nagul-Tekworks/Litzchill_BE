import { Meme } from "../../_model/MemeModel.ts";
import { ErrorResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from '../_constants/HttpStatusCodes.ts';
import { MEME_ERROR_MESSAGES } from "../_messages/Meme_Module_Messages.ts";

/*
 * Validates if the request's content type is a valid "multipart/form-data" type.
 * @param contentType The content type of the request.
*/
export function contentTypeValidations(contentType: string): boolean {
    console.log("Validating content type:", contentType); // Log the content type being validated
    if (!contentType || !contentType.includes("multipart/form-data")) {
        console.warn("Invalid content type: " + contentType); // Be specific about the invalid type.
        return false;
    }
    console.log("Content type is valid: multipart/form-data");
    return true;
}

export function parseTags(tagsRaw: string | null): string[] {
    console.log("Parsing tags:", tagsRaw); // Log raw tags input
    if (!tagsRaw || tagsRaw.trim().length === 0) {
        console.log("No tags provided, returning empty array.");
        return [];
    }

    if (tagsRaw.trim().startsWith("[") && tagsRaw.trim().endsWith("]")) {
        console.log("Tags are in JSON format, parsing as array.");
        const parsedTags = JSON.parse(tagsRaw);
        if (!Array.isArray(parsedTags)) {
            throw new Error("Tags is not an array");
        }
        return parsedTags;
    }

    console.log("Tags are in comma-separated format, splitting.");
    return tagsRaw.split(",").map(tag => tag.trim());
}

/**
 * Main validation function
 * @param memeData - Meme data object to validate
 * @param isUpdate - Boolean flag to indicate whether the request is for an update
 * @returns Validation result object or error response
 */
export function validateMemeData(memeData: Partial<Meme>, isUpdate: boolean = false) {
    const {meme_title, media_file, tags } = memeData;  
    const validationErrors: string[] = [];
    console.log("Validating meme data:", memeData);

    // If creating a meme, check for required fields
    if (!isUpdate) {
        checkRequiredFields(meme_title, media_file , tags, validationErrors);
    }
    // Common validation for both create and update
    validateMemeFields(meme_title, media_file, tags, validationErrors);

    // Returning validation errors if any
    if (validationErrors.length > 0) {
        console.log("Validation errors:", validationErrors); // Log validation errors
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, validationErrors.join(", "));
    }

    console.log("Meme data validated successfully.");
    // Validation passed
    return {};
}

/**
 * Validates meme title, image URL, and tags
 * @param meme_title - Meme title to validate
 * @param image_url - Image URL to validate
 * @param tags - Tags array to validate
 * @param validationErrors - Array to accumulate validation error messages
 */
function validateMemeFields(meme_title: string | undefined, image_url: string | undefined, tags: string[] | undefined, validationErrors: string[]) {
    console.log("Validating meme fields:", { meme_title, image_url, tags });

    // Validate meme title
    if (meme_title) {
        console.log("meme_title is: ", meme_title);
        if (meme_title.trim().length < 3 || meme_title.trim().length > 100) {
            validationErrors.push(MEME_ERROR_MESSAGES.MEME_TITLE_EXCEEDS_LIMIT);
        }
        if (!/^[A-Za-z0-9\s.,'!?-]+$/.test(meme_title)) {
            validationErrors.push(MEME_ERROR_MESSAGES.INVALID_MEME_TITLE);
        }
    }

    // Validate image URL
    try {
        if (image_url && !image_url.trim()) {
            console.log("image_url is: ", image_url);
            validationErrors.push(MEME_ERROR_MESSAGES.MISSING_IMAGE_URL);
        }
    } catch (error) {
        console.log("Error validating image URL:", error);
    }

    // Validate tags
    if (tags) {
        if (tags.length === 0) {
            validationErrors.push(MEME_ERROR_MESSAGES.MISSING_TAGS);
        }
        for (const tag of tags) {
            console.log("Validating tag:", tag); // Log each tag being validated
            if (tag.length < 1 || tag.length > 15 || !/^[A-Za-z0-9\s-]+$/.test(tag)) {
                validationErrors.push(MEME_ERROR_MESSAGES.INVALID_TAG);
            }
        }
    }
}

/**
 * Helper function to check required fields for meme creation
 * @param user_id - User ID to validate
 * @param meme_title - Meme title to validate
 * @param image_url - Image URL to validate
 * @param tags - Tags array to validate
 * @param errors - Array to accumulate error messages
 */
function checkRequiredFields(
    meme_title: string | undefined, 
    image_url: string | undefined, 
    tags: string[] | undefined, 
    errors: string[]
) {
    console.log("Checking required fields for meme creation.");

    if (!meme_title) errors.push(MEME_ERROR_MESSAGES.MISSING_MEME_TITLE);
    if (!image_url) errors.push(MEME_ERROR_MESSAGES.MISSING_IMAGE_URL);
    if (!tags || tags.length === 0) errors.push(MEME_ERROR_MESSAGES.MISSING_TAGS);
}
