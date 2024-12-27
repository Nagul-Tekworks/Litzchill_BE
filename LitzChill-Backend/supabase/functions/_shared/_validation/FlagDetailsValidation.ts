import { V4 } from "@V4";
import { FlagModel } from "@model/FlagModel.ts";
import {ErrorResponse} from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { FLAG_VALIDATION_MESSAGES } from "@shared/_messages/FLagModuleMessags.ts";
import { Logger } from "@shared/_logger/Logger.ts";


/**
 * Validates the flag details provided by the user.
 * 
 * @param flagDetails - The details of the flag to be validated.
 * @returns {Response | null} - Returns an error response if validation fails, or null if validation passes.
 */


export function validateFlagDetails(flagDetails: FlagModel):Response|null {
    const logger=Logger.getloggerInstance();
    //validating flag details.
    logger.info(`Validating comment details...`);

    if (Object.keys(flagDetails).length === 0) {
        logger.error("Empty flag Body returning error response");
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            COMMON_ERROR_MESSAGES.EMPTY_REQUEST_BODY,

        );
    }

    // Checking Content Type
    if (flagDetails.contentType) {
        if((flagDetails.contentType!=='Meme')&&(flagDetails.contentType!=='meme')){
            logger.error(`Invalid Content Type: , ${flagDetails.contentType}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.BAD_REQUEST,
                 FLAG_VALIDATION_MESSAGES.INVALID_CONTENTTYPE
            )
        }
    }else{
        logger.error(`ERROR: Missing Content Type`);
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             FLAG_VALIDATION_MESSAGES.MISSING_CONTENT_TYPE
        )
    }

    //checking content Id
    if(flagDetails.contentId){
        if(!V4.isValid(flagDetails.contentId)){
            logger.error(`ERROR: Inavlid Content Id: ${flagDetails.contentId}`);
            return ErrorResponse(
                  HTTP_STATUS_CODE.BAD_REQUEST,
                  FLAG_VALIDATION_MESSAGES.INAVLID_CONTENT_ID
            )
        }
    }else{
        logger.error(`Missing Content Id returning error response`);
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            FLAG_VALIDATION_MESSAGES.MISSING_CONTENT_ID
       )
    }

    //validating reason length
    if(flagDetails.reason){
        if (flagDetails.reason.trim().length <= 3) {
            logger.error(' returning Inavlid Flag Reason error response');
           return ErrorResponse(
              HTTP_STATUS_CODE.BAD_REQUEST,
              FLAG_VALIDATION_MESSAGES.INVALID_REASON
            );
        }
    }
    else{
        logger.error('Returning missing flag reason response');
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            FLAG_VALIDATION_MESSAGES.MISSING_FLAG_REASON
          );
    }

    logger.info(`Flag details validated successfully`);
    return null;
}