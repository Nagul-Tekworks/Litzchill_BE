import { V4 } from "@V4";
import {ErrorResponse} from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";

import { ContestModel } from "@model/ContestModel.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { CONTEST_VALIDATION_MESSAGES } from "@shared/_messages/ContestModuleMessages.ts";
import { Logger } from "@shared/_logger/Logger.ts";

/**
 * Validates if the provided contest ID is valid.
 * 
 * @param contest_id - The contest ID to validate.
 * @returns {Response|null} - Returns an error response if the contest ID is missing or invalid, otherwise returns null.
 *
*/

export function validateContestId(contest_id:string): Response | null {
    const logger=Logger.getloggerInstance();
    logger.info("Validating Contest ID");
    if (!contest_id ) {
        logger.error("missing contest ID.");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             CONTEST_VALIDATION_MESSAGES.MISSING_CONTEST_ID,
         
        );
     }
     if ( !V4.isValid(contest_id)) {
        logger.error("Invalid contest ID.");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_ID,
         
        );
     } 
     logger.info(`contest id validated successfully`);
     return null;  
}

/**
 * Validates the details of a contest.
 * 
 * @param contestDetails - The contest details to validate.
 * @param isUpdate - A boolean flag indicating if this is an update operation. Defaults to false.
 * @returns {Response|null} - Returns an error response if any validation fails, otherwise returns null.
 * - If any required fields are missing or invalid, an appropriate error message is returned.
 */

export function validateContestDetails(contestDetails: Partial<ContestModel>, isUpdate: boolean = false): Response | null {
    const logger=Logger.getloggerInstance();
    logger.info("Validating contest details...");

    const current_date=new Date();
    const CONTEST_STATUS:string[] =["ongoing", "completed", "upcoming"];

    //checking for empty body if body empty, directlly returning error responses
    if (Object.keys(contestDetails).length === 0) {
        logger.error("Empty request body.");
        return ErrorResponse(
              HTTP_STATUS_CODE.BAD_REQUEST,
              COMMON_ERROR_MESSAGES.EMPTY_REQUEST_BODY,
          
        );
    }

    
    // Validating contest title if invalid title returning error message.
    if (contestDetails.contest_title) {
        contestDetails.contest_title=contestDetails.contest_title.replace(/\s+/g, ' ').trim();
        if (contestDetails.contest_title.length < 3 || contestDetails.contest_title.length > 100) {
            logger.error("Invalid contest title length: Title must be between 3 and 100 characters.");4
             return ErrorResponse(
                 HTTP_STATUS_CODE.BAD_REQUEST,
                 CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_TITLE
            );
           
        }
    } //if validation for create contest then title is required
    else if (!isUpdate) {
        logger.error("Contest title is missing.");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             CONTEST_VALIDATION_MESSAGES.MISSING_CONTEST_TITLE
        );
    }

    // Validating contest description
    if (contestDetails.description) {
        contestDetails.description=contestDetails.description.replace(/\s+/g, ' ').trim();
        if (contestDetails.description.length < 8 || contestDetails.description.length > 500) {
           
            logger.error("Invalid contest description length: Description must be between 8 and 500 characters.");
            return ErrorResponse(
                 HTTP_STATUS_CODE.BAD_REQUEST,
                 CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_DESCRIPTION
            );
        }
    }

    // Validating contest start_date
    if (contestDetails.start_date) {
        if (!isValidISODate(contestDetails.start_date)) {
           
            logger.error("Invalid start date format.");
            return ErrorResponse(
                 HTTP_STATUS_CODE.BAD_REQUEST,
                 CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_START_DATE_FORMAT
            ); 
        } 
        if(!isUpdate){
            const start_date=new Date(contestDetails.start_date);
            if(start_date<current_date){
                logger.error("Invalid start date  cannot les than current date.");
                return ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    CONTEST_VALIDATION_MESSAGES.INVALID_START_DATE_VALUE
               )
            }
          

        }
    }//if validation for create contest then start date is required
     else if (!isUpdate) {
        logger.error("Contest start date is missing.");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             CONTEST_VALIDATION_MESSAGES.MISSING_CONTEST_START_DATE
        );
    }

    // Validating contest end_date
    if (contestDetails.end_date) {

        if (!isValidISODate(contestDetails.end_date)) {
           
            logger.error("Invalid end date format.");
            return ErrorResponse(
                 HTTP_STATUS_CODE.BAD_REQUEST,
                 CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_END_DATE_FORMAT
           );
        }
        else {//ensuring end date can not be less to start date and current date.
            const end_date = new Date(contestDetails.end_date);
            if (contestDetails.start_date && isValidISODate(contestDetails.start_date)) {
              
               
                if(!isUpdate){
                    if (current_date > end_date) {
                        logger.error("End date must be after the current date.");
                        return ErrorResponse(
                             HTTP_STATUS_CODE.BAD_REQUEST,
                             CONTEST_VALIDATION_MESSAGES.INVALID_END_DATE_VALUE
                       );
                    }
                }
                const start_date = new Date(contestDetails.start_date);
                if (start_date >= end_date) {
                    
                    logger.error("End date must be after the start date.");
                    return ErrorResponse(
                         HTTP_STATUS_CODE.BAD_REQUEST,
                         CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_END_DATE
                   );
                }
            }
        }
    } //if validation for create contest then end date is required
    else if (!isUpdate) {
        logger.error("Contest end date is missing.");
        return ErrorResponse(
             HTTP_STATUS_CODE.BAD_REQUEST,
             CONTEST_VALIDATION_MESSAGES.MISSING_CONTEST_END_DATE
       );
    }

    
    // Validating contest status
    if (contestDetails.status) {
       
        contestDetails.status=contestDetails.status.toLowerCase();
        if (!CONTEST_STATUS.includes(contestDetails.status)) {
            logger.error(`Invalid contest status: Valid statuses are, ${CONTEST_STATUS.join(", ")}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.BAD_REQUEST,
                 CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_STATUS
            );
        }
       
    }

    if(contestDetails.result||Object.keys(contestDetails).includes('result')){
        if(typeof contestDetails.result !=='object'|| contestDetails.result === null){
            logger.error(`Invalid contest result type`);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                CONTEST_VALIDATION_MESSAGES.INVALID_TYPE_FOR_RESULT
            )
        }
        if (Object.keys(contestDetails.result).length < 3) {
             logger.error(`Invalid contest result`);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                CONTEST_VALIDATION_MESSAGES.EMPTY_PRIZE
            );
        }
    }
    if (contestDetails.prize||Object.keys(contestDetails).includes('prize') ){
        if (typeof contestDetails.prize !== 'object' || contestDetails.prize === null) {
            logger.error(`Invalid contest prize type`);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                CONTEST_VALIDATION_MESSAGES.INVALID_TYPE_FOR_PRIZE
            );
        }
    
        // Check if the object is empty (fewer than 3 properties)
        if (Object.keys(contestDetails.prize).length < 3) {
            logger.error(`Invalid contest prize`);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                CONTEST_VALIDATION_MESSAGES.EMPTY_PRIZE
            );
        }
    }


    logger.info(`initializing contest status base on contest start date.`);
    if(contestDetails.start_date&&!isUpdate){
        const start_date = new Date(contestDetails.start_date);
        if(start_date>current_date){
            contestDetails.status=CONTEST_STATUS[0].toLowerCase();
        }
        contestDetails.status=CONTEST_STATUS[2].toLowerCase();
    }

    logger.info("contest details Validated Successfully");
    return null;

}

/**
 * Validates if a given date string is in valid ISO format.
 * 
 * @param date - The date string to validate.
 * @returns {boolean} - Returns true if the date is valid ISO format, otherwise false.
 */
export function isValidISODate(date: string): boolean {
    const logger=Logger.getloggerInstance();
    logger.info('Validating Dates Formate Using regex');
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
    return isoDateRegex.test(date);
}

