import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";

import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE } from "../_messages/ContestEntryMsgs.ts";
import { ErrorResponse } from "../../_responses/Response.ts";


export function validateContestId(contestId:string){
    if (!contestId || !V4.isValid(contestId)) {
        return ErrorResponse(
          
          HTTP_STATUS_CODE.BAD_REQUEST,
          CONETST_ENTRY_ERROR_MESSAGE.INVALID_INPUT,
        );
      }
     return {};
    }