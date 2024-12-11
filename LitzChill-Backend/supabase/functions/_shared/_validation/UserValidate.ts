import ErrorResponse from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { USERMODULE } from "../_messages/userModuleMessages.ts";

export function isPhoneAvailable(phone:string)
{
    if(!phone)
    {
        return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,USERMODULE.PHONENUMBER)
    }
}

export  function isOtpAvailable(Otp:string)
{
    if(!Otp)
    {
        return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,USERMODULE.OTP)
    }
}
