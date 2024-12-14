
import { getAllContestDetails } from "../../_repository/_contest_repo/ContestRepository.ts";
import {ErrorResponse} from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { SuccessResponse } from "../../_responses/Response.ts";
import { CONTEST_MODULE_ERROR_MESSAGES, CONTEST_MODULE_SUCCESS_MESSAGES } from "../../_shared/_messages/ContestModuleMessages.ts";


/**
 * Handles the getting of a all existing contest which is not deleted.
 * 
 * @param {Request}req- The HTTP request object.
 * @param {Record<string, string>}params - Additional URL parameters contains(User Details).
 * @returns {Promise<Response>} - A response indicating success or failure:
 *
 * - SUCCESS: Returns a 200 OK response with all contest data and  success message .

 * - FAILURE: On failure due to validation or database issues, returns an appropriate error response.
 */

export async function handlegetAllContest(req:Request,params:Record<string,string>): Promise<Response>  {
    
    try {
        
         console.info(`INFO: Request Recieved to get all contest data`);
        //calling repository function
        const {data,error}=await getAllContestDetails();

        //if any database error returning error message 
        if(error){
            console.error(`ERROR : Database Error during getting all contest data,${error.message}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 `${COMMON_ERROR_MESSAGES.DATABASE_ERROR},${error.message}`
            )
        }
        //if data is not there or empty object coming
        if(!data||data.length==0){
            console.error(`ERROR : No contest found`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 CONTEST_MODULE_ERROR_MESSAGES.NO_CONTEST_FOUND 
            )
        }

        //returning success response with data
        console.info(`INFO: Returning all contest details :`,data);
        return SuccessResponse(
             CONTEST_MODULE_SUCCESS_MESSAGES.CONTEST_DETAILS_FETCHED,
             HTTP_STATUS_CODE.OK,
             data,
        )

    } catch (error) {
        console.error(`ERROR: Internal Server Error during getting all contest data,${error}`);
        return ErrorResponse(
             HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
             `${COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR}, ${error}`
       )
    }
}