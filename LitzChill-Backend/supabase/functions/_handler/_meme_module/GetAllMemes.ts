import { fetchMemes } from "../../_repository/_meme_repo/MemeRepository.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "../../_shared/_messages/Meme_Module_Messages.ts";


export default async function getAllMemes(req:Request) { 
    try {

        const url = new URL(req.url)
        const page = Number(url.searchParams.get('page')) || 1;
        const limit = Number(url.searchParams.get('limit')) || 50;
        const sort = url.searchParams.get('sort') || "popular";
        const tag = url.searchParams.get('tag')|| null ;

        console.log(page, limit, sort, tag);
        // Fetch memes from the repository using the provided parameters
        const { data: allmemes, error } = await fetchMemes(page, limit, sort,tag);
 
        // Handle errors and return appropriate responses
        if (error || !allmemes || allmemes.length === 0) {
            console.log("Fetching failed or no memes found");
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.NO_MEMES);
        }
        
        // Return the fetched memes
        return SuccessResponse(MEME_SUCCESS_MESSAGES.MEME_FETCHED_SUCCESSFULLY, allmemes);
}
catch (error) {
    console.error("Error updating meme:", error);
    return  ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
}
}
