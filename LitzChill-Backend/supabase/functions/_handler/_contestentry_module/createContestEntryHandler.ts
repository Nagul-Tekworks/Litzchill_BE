import { insertContestEntry, validateContestEntry } from "../../_repository/_contestentry_repo/createContestEntryRepo.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE, CONETST_ENTRY_SUCCESS_MESSAGE } from "../../_shared/_messages/ContestEntryMsgs.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestId } from "../../_shared/_validation/ContestEntryValidation.ts";
import createMeme from "../_meme_module/CreateMeme.ts";

export default async function handleSubmitContestEntry(req: Request, param: Record<string, string>): Promise<Response> {
  try {
    // Extracting contestId and userId from params
    const contestId = param.id;
    const userId = param.user_id;
    console.log("Received contestId:", contestId); // Log received contestId
    console.log("Received userId:", userId); // Log received userId

    // Check for missing userId
    if (!userId) {
      console.log("User ID is missing, returning unauthorized response."); // Log if user_id is missing
      return ErrorResponse(HTTP_STATUS_CODE.UNAUTHORIZED,COMMON_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
     }

    // Validate contestId
    const validatedId = validateContestId(contestId);
    if (validatedId instanceof Response) {
      console.log("Contest ID validation failed, returning response:", validatedId); // Log if validation fails
      return validatedId;
    }
    console.log("Contest ID validated successfully.");

    // Validate contest existence and check its status
    const { contestData, errorInContest } = await validateContestEntry(contestId);
    console.log("Contest validation data:", contestData); // Log contest data
    if (errorInContest) {
      console.error("Error in contest validation:", errorInContest); // Log error if validation fails
      return ErrorResponse( HTTP_STATUS_CODE.BAD_REQUEST,COMMON_ERROR_MESSAGES.DATABASE_ERROR);
    }

     if(!contestData || contestData.length==0){
      return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,CONETST_ENTRY_ERROR_MESSAGE.INVALID_CONTEST);
    }
    if(contestData && contestData[0].status!="ongoing"){
      return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,CONETST_ENTRY_ERROR_MESSAGE.WRONG_CONTEST);
    }
    // Proceed to create meme
    const memeResponse = await createMeme(req, param); // Call to create meme function
    if (!memeResponse.ok) {
      console.error("Meme creation failed, returning internal server error response.");
      return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.DATABASE_ERROR);
    }
  // Log and extract meme_id from the response
    const memeData = await memeResponse.json();
    console.log("Meme response received:", memeData);
    const memeId = memeData.body.data[0].meme_id;
    console.log("Created meme id is:", memeId); // Log the meme ID from the response

    // Now insert into contest entry table
    console.log("Inserting into contest entry with meme_id:", memeId, "and user_id:", userId);
    const { insertedData, errorInInsert } = await insertContestEntry({
      //createing object for meme
      contest_id: contestId, // contestId passed from param
      meme_id: memeId, // meme_id returned from createMeme response
      user_id: userId, // userId passed from param
      created_at: new Date(),
      like_count: 0,
      comment_count: 0,
      flag_count: 0,
      rank: 0,
      status: "Active"
    });

    // Handle error in insertion
    if (errorInInsert) {
      console.error("Error inserting contest entry:", errorInInsert); // Log if there is an error during insert
      return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.DATABASE_ERROR);
    }

    // Handle case where no contest entry was inserted
    if (!insertedData || insertedData.length === 0) {
      console.log("No contest entry inserted, returning database error response."); // Log if no data is inserted
      return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,CONETST_ENTRY_ERROR_MESSAGE.ALLREADY_REG);
    }

    console.log("Contest entry inserted successfully:", insertedData); // Log successful insertion
    return SuccessResponse(
      HTTP_STATUS_CODE.OK,CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_POST,insertedData);
  } catch (error) {
    console.error("Error in handleSubmitContestEntry:", error); // Log the error if any exception is thrown
    return ErrorResponse(
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
   }
}
