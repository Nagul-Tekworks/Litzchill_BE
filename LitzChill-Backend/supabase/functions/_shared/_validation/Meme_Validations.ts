/*
 * Validates if the request's content type is a valid "multipart/form-data" type.
 * @param contentType The content type of the request.
 * @returns True if the content type is valid, false otherwise.
 * @throws Throws an error if the content type is not a valid "multipart/form-data" type.
*/
export function contentTypeValidations(contentType: string): boolean {
    if (!contentType) {
        console.warn("Content type is not valid " + contentType);
    }
    return contentType.includes("multipart/form-data");
}

export function parseTags(tagsRaw: string): string[] {
    if (tagsRaw.trim().startsWith("[") && tagsRaw.trim().endsWith("]")) {
        const parsedTags = JSON.parse(tagsRaw);
        if (!Array.isArray(parsedTags)) {
            throw new Error("Tags is not an array");
        }
        return parsedTags;
    }
    return tagsRaw.split(",").map(tag => tag.trim());
}

// Returns true if the title is valid else false
export const validateMemeTitle = (meme_title: string): boolean => 
    meme_title.length > 0 && meme_title.length <= 30;

// Returns true if the tags are valid else false
export const validateTags = (tags: string[]): boolean => 
    tags.every(tag => tag.length >= 1 && tag.length <= 15);

