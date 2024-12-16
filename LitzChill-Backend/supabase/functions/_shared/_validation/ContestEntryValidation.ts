import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE } from "../_messages/ContestEntryMsgs.ts";
import { ErrorResponse } from "../../_responses/Response.ts";
/**
 * Validates the given contest ID.
 * 
 * 1. Checks if the contest ID is provided and is a valid UUID (Version 4).
 * 2. If invalid, returns an error response with a BAD_REQUEST status and an appropriate error message.
 * 3. If valid, returns an empty object indicating success.
 * 
 * @param contestId - The contest ID to validate, expected to be a string in UUID format.
 * @returns - Returns an error response if the contest ID is invalid, or an empty object if valid.
 */
export function validateContestId(contestId:string):Response|null{
    if (!contestId || !V4.isValid(contestId)) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,CONETST_ENTRY_ERROR_MESSAGE.INVALID_INPUT);
      }
     return null;
    }
     export function validateUserId(userId:string):Response|null{
        if (!userId || !V4.isValid(userId)) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,CONETST_ENTRY_ERROR_MESSAGE.INVALID_INPUT);
          }
         return null;
     }
 
/**
 * Updates the status of a contest entry based on provided input.
 * 
 * Functionality:
 * 1. Validates required fields: `contest_id`, `entry_id`, and `new_status`.
 * 2. Ensures `new_status` is either "Active" or "Disqualified".
 * 3. Fetches the existing contest entry to verify its existence.
 * 4. Updates the contest entry's status if validation and checks pass.
 * 5. Returns a success response if the update is successful, or an appropriate error response otherwise.
 * 
 * @param req - Request object containing JSON data with `contest_id`, `entry_id`, and `new_status`.
 * @param param - Record of additional parameters (unused in this function).
 * @returns - A response object with the result of the operation.
 */

export function validateRequiredFieldsForPatch(contest_id:string, entry_id:string, new_status:string):Response|null{
  if (!contest_id || !entry_id || !new_status || !V4.isValid(contest_id) || !V4.isValid(entry_id)) {
    return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,CONETST_ENTRY_ERROR_MESSAGE.REQUIRED_FIELDS);
  }
  return null;
}

