import { ErrorResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { MEME_ERROR_MESSAGES } from "../_messages/Meme_Module_Messages.ts";

/**
 * Validates if the request's content type is a valid "multipart/form-data" type.
 *
 * @param {string} contentType - The content type of the request.
 * @returns {boolean} - Returns `true` if the content type is "multipart/form-data", otherwise `false`.
 */
export function contentTypeValidations(contentType: string): boolean {
    if (!contentType || !contentType.includes("multipart/form-data")) {
        console.warn("Invalid content type: " + contentType); // Be specific about the invalid type.
        return false;
    }
    return true;
}

/**
 * Parses a raw string of tags into an array of tags.
 *
 * @param {string | null} tagsRaw - The raw tags as a string.
 * @returns {string[]} - An array of tag strings.
 */
export function parseTags(tagsRaw: string | null): string[] {
    if (!tagsRaw || tagsRaw.trim().length === 0) {
        return [];
    }

    if (tagsRaw.trim().startsWith("[") && tagsRaw.trim().endsWith("]")) {
        try {
            const parsedTags = JSON.parse(tagsRaw);
            if (!Array.isArray(parsedTags)) {
                throw new Error("Tags is not an array");
            }
            return parsedTags;
        } catch (error) {
            console.error("Error parsing tags: ", error);
            throw error;
        }
    }

    return tagsRaw.split(",").map(tag => tag.trim());
}

/**
 * Main function to validate meme data.
 *
 * @param {boolean} isUpdate - Indicates whether the request is for an update.
 * @param {string | undefined} meme_title - The meme title.
 * @param {string[] | undefined} tags - Array of tags.
 * @param {File | undefined} media_file - The media file.
 * @returns {Response | null} - Returns an error response if validation fails, otherwise `null`.
 */
export function validateMemeData(
    isUpdate: boolean = false,
    meme_title?: string,
    tags?: string[],
    media_file?: File
) {
    const validationErrors: string[] = [];
    console.log("Starting meme data validation");

    // Validate required fields for creation
    if (!isUpdate) {
        validateRequiredFields(meme_title, tags, media_file, validationErrors);
    }

    // Validate common fields
    validateMemeFields(meme_title, tags, validationErrors);

    // Return errors if any
    if (validationErrors.length > 0) {
        return validationErrors;
    }

    console.log("Meme data validation successful");
    return null;
}

/**
 * Validates meme fields like title and tags.
 *
 * @param {string | undefined} meme_title - The meme title.
 * @param {string[] | undefined} tags - The tags array.
 * @param {string[]} validationErrors - Array to accumulate validation errors.
 */
function validateMemeFields(
    meme_title: string | undefined,
    tags: string[] | undefined,
    validationErrors: string[]
) {
    console.log("Validating meme fields");

    // Validate meme title
    if (meme_title) {
        if (meme_title.trim().length < 3 || meme_title.trim().length > 100) {
            validationErrors.push(MEME_ERROR_MESSAGES.MEME_TITLE_EXCEEDS_LIMIT);
        }
    }

    // Validate tags
    if (tags && tags.length > 0) {
        for (const tag of tags) {
            if (tag.length < 1 || tag.length > 15 || !/^[A-Za-z0-9\s-]+$/.test(tag)) {
                validationErrors.push(MEME_ERROR_MESSAGES.INVALID_TAG);
            }
        }
    }
}

/**
 * Validates required fields for meme creation.
 *
 * @param {string | undefined} meme_title - The meme title.
 * @param {string[] | undefined} tags - The tags array.
 * @param {File | undefined} media_file - The media file.
 * @param {string[]} errors - Array to accumulate validation errors.
 */
function validateRequiredFields(
    meme_title: string | undefined,
    tags: string[] | undefined,
    media_file: File | undefined,
    errors: string[]
) {
    console.log("Checking required fields");

    if (!meme_title || meme_title.trim().length === 0) {
        errors.push(MEME_ERROR_MESSAGES.MISSING_MEME_TITLE);
    }

    if (!tags || tags.length === 0) {
        errors.push(MEME_ERROR_MESSAGES.MISSING_TAGS);
    }

    if (!media_file) {
        errors.push(MEME_ERROR_MESSAGES.MISSING_MEDIA_FILE);
    }
}
