import { sendOtp } from "../../_repository/_user_repo/AuthRepo.ts";


import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";

import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "../../_responses/Response.ts";
import ErrorResponse from "../../_responses/Response.ts";

import { getUser } from "../../_repository/_user_repo/UserRepository.ts";
import { isPhoneAvailable } from "../../_shared/_validation/UserValidate.ts";
/**
 * This function can accept the request to generate otp and return to corresponding response
 * @param req 
 * @returns 
 */
export default async function signInWithOtp(req: Request) {
  console.log("Start of signin");

  const { phoneNo } = await req.json();
  // This method checks the phone number is available or not
  const phoneNoIsnotThere = isPhoneAvailable(phoneNo);

  if (phoneNoIsnotThere instanceof Response) {
    return phoneNoIsnotThere;
  }

  const user = await getUser(phoneNo); //getting user with phone number

  if (user) {
    console.log("user loc out time",user.lockout_time)
   
    const currentTime=new Date().toISOString();
    console.log("current time",currentTime)
    console.log("CUrrent time,",currentTime)
    console.log(!user.lockout_time&&user.lockout_time>currentTime);
    if(user.lockout_time&&user.lockout_time>currentTime)
    {
      return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN,`${USERMODULE.ACCOUNT_DEACTIVATED} Try after ${user.lockout_time}`)
    }
    const { data, error } = await sendOtp(phoneNo);

    if (error) {
      return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error}`,);
    }
    return SuccessResponse(USERMODULE.SENT_OTP_SUCCESS);
  }

  if (!user) {
    const { data, error } = await sendOtp(phoneNo);
    if (error) {
      return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error}`,);
    } else {
      return SuccessResponse(USERMODULE.SENT_OTP_SUCCESS);
    }
  }
}
