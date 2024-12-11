import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";

import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE } from "../_messages/ContestEntryMsgs.ts";
import { ErrorResponse } from "../../_responses/Response.ts";
import ContestEntryModel from "../../_model/contest_entry_model.ts";


export function validateContestId(contestId:string){
    if (!contestId || !V4.isValid(contestId)) {
        return ErrorResponse(
          
          HTTP_STATUS_CODE.BAD_REQUEST,
          CONETST_ENTRY_ERROR_MESSAGE.INVALID_INPUT,
        );
      }
     return {};
 }
export function validateRequiredFields(body:ContestEntryModel){
  if (!body.user_id || !body.meme_id  || !V4.isValid(body.user_id)  || !V4.isValid(body.meme_id)) {
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            CONETST_ENTRY_ERROR_MESSAGE.INVALID_JSON,
        );
    }
    return {};
  }

export function validateRequiredFieldsForPatch(contest_id:string, entry_id:string, new_status:string){
  if (!contest_id || !entry_id || !new_status || !V4.isValid(contest_id) || !V4.isValid(entry_id)) {
    return ErrorResponse(
      HTTP_STATUS_CODE.BAD_REQUEST,
      CONETST_ENTRY_ERROR_MESSAGE.REQUIRED_FIELDS
    );
  }
  return {};
}

