import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { FlagModel } from "../../_model/FlagModel.ts";
import {ErrorResponse} from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../_messages/ErrorMessages.ts";
import { FLAG_VALIDATION_MESSAGES } from "../_messages/FLagModuleMessags.ts";


/**
 * Validates the flag details provided by the user.
 * 
 * @param flagDetails - The details of the flag to be validated.
 * @returns {Response | null} - Returns an error response if validation fails, or null if validation passes.
 */


export function validateFlagDetails(flagDetails: FlagModel):Response|null {
    
    //validating flag details.
    console.log("INFO: Validating comment details...");

    if (Object.keys(flagDetails).length === 0) {
        console.error("ERROR: Empty Body");
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            COMMON_ERROR_MESSAGES.EMPTY_REQUEST_BODY,

        );
    }

    // Checking Content Type
    if (flagDetails.contentType) {
        if((flagDetails.contentType!=='Meme')&&(flagDetails.contentType!=='meme')){
            console.error("ERROR: Invalid Content Type: ",flagDetails.contentType);
            return ErrorResponse(
                 HTTP_STATUS_CODE.BAD_REQUEST,
                 FLAG_VALIDATION_MESSAGES.INVALID_CONTENTTYPE
            )
        }
    }else{
        console.error("ERROR: Missing Content Type");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             FLAG_VALIDATION_MESSAGES.MISSING_CONTENT_TYPE
        )
    }

    //checking content Id
    if(flagDetails.contentId){
        if(!V4.isValid(flagDetails.contentId)){
            console.error('ERROR: Inavlid Content Id: ',flagDetails.contentId);
            return ErrorResponse(
                  HTTP_STATUS_CODE.BAD_REQUEST,
                  FLAG_VALIDATION_MESSAGES.INAVLID_CONTENT_ID
            )
        }
    }else{
        console.error('ERROR: Missing Content Id');
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            FLAG_VALIDATION_MESSAGES.MISSING_CONTENT_ID
       )
    }

    //validating reason length
    if(flagDetails.reason){
        if (flagDetails.reason.trim().length <= 3) {
            console.error('ERROR:Inavlid Flag Reason');
           return ErrorResponse(
              HTTP_STATUS_CODE.BAD_REQUEST,
              FLAG_VALIDATION_MESSAGES.INVALID_REASON
            );
        }
    }
    else{
        console.error('ERROR:Missing Flag Reason');
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            FLAG_VALIDATION_MESSAGES.MISSING_FLAG_REASON
          );
    }

    return null;
}