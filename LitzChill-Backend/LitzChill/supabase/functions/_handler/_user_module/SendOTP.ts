import { sendOtp } from "../../_repository/_user_repo/AuthRepo.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "../../_responses/Response.ts";
import ErrorResponse from "../../_responses/Response.ts";
import { getUser } from "../../_repository/_user_repo/UserRepository.ts";
import { isPhoneAvailable } from "../../_shared/_validation/UserValidate.ts";
import { LOGERROR,LOGINFO } from "../../_shared/_messages/userModuleMessages.ts";

/**
 * This function sends OTP to the user by checking the following conditions:
 * 1. It will check if the user is already present or not.
 * 2. If the user is present, then it will check if the user is in lockout.
 * 3. If the user is in lockout, then it will return an error response.
 * 4. If the user is not in lockout time, it will send the OTP.
 * 5. If the user is a new user, it will directly send OTP to the corresponding phone number.
 * 
 * @param req --It is a request in the form of JSON.
 * @returns -- It will return a response object.
 */
export default async function signInWithOtp(req: Request): Promise<Response> {
    try {
        const body = await req.json();
        const phoneNo = body.phoneNo;

        console.log(LOGINFO.OTP_SEND_STARTED.replace("{phoneNo}", phoneNo));  // Log info when OTP sending starts

        // This method checks the phone number is available or not
        const phoneNoIsnotThere = isPhoneAvailable(phoneNo);
        if (phoneNoIsnotThere instanceof Response) {
            return phoneNoIsnotThere;
        }

        const { data: user, error: userError } = await getUser(phoneNo); // Getting user with phone number
        if (userError) {
            console.error(LOGERROR.USER_NOT_FOUND, userError);  // Log error if user is not found
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${userError}`);
        }

        if (user) {
            const currentTime = new Date().toISOString();

            if (user.lockout_time && user.lockout_time > currentTime) {
                console.log(LOGINFO.USER_FOUND.replace("{phoneNo}", phoneNo));  // Log user found
                return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, `${USERMODULE.ACCOUNT_DEACTIVATED} Try after ${user.lockout_time}`);
            }

            console.log(LOGINFO.USER_NOT_LOCKED_OUT.replace("{phoneNo}", phoneNo));  // Log user is not in lockout
        }

        // Send OTP
        const { data: _data, error } = await sendOtp(phoneNo);
        if (error) {
            console.error(LOGERROR.OTP_SEND_ERROR, error);  // Log error if OTP send fails
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
        } else {
            console.log(LOGINFO.OTP_SENT_SUCCESS.replace("{phoneNo}", phoneNo));  // Log success message when OTP is sent
            return SuccessResponse(USERMODULE.SENT_OTP_SUCCESS, HTTP_STATUS_CODE.OK);
        }

    } catch (error) {
        console.error(LOGERROR.INTERNAL_SERVER_ERROR, error);  // Log any internal server error
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
