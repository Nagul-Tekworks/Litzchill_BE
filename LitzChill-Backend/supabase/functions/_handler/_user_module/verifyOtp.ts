
import { otpVerication } from "../../_repository/_user_repo/AuthRepo.ts";
// import { UserProfile } from "../model/UserTable.ts";
import { getUser, RegisterUser } from "../../_repository/_user_repo/UserRepository.ts";
import { makeUserLockout } from "../../_repository/_user_repo/UserRepository.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";

import { isOtpAvailable, isPhoneAvailable } from "../../_shared/_validation/UserValidate.ts";


/**
 * Flow of this method
 * first check if user exists with mobile
 * invoke verify-otp
 * any error, check user exists, if exists increment login count,
 * no error, if user exits, make it to default value login count .0 send session
 * no user create user, in response send session
 * 
 * @param req 
 * @returns 
 */
export default async function verifyOtp(req: Request){
 
    console.error("Verify OTP API started");
    const body = await req.json();
    const phoneNo:string=body.phoneNo;
    const Otp:string=body.Otp;

    const validPhone=isPhoneAvailable(phoneNo)
   
    if(validPhone instanceof Response)
    {
        return validPhone;
    }
    const validOtp=isOtpAvailable(Otp);
    console.log("Phone is valid")
    if(validOtp instanceof Response)
        {
           
            return validOtp;
        }

    console.log("Otp valid")
    const user = await getUser(phoneNo)
    if(user instanceof Response)
        return user
    if(user){
        console.log("User verify succesfully ",(user));
    }
   
   
  
    const {data,error}=await otpVerication(phoneNo,Otp)

    if(error || !data){
        console.log("User failed count  : ",user.failed_login_count);
        if(user){
            console.log(user.lockout_time)
            if(user.lockout_time>new Date().toISOString())
                return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN,USERMODULE.USER_LOCKED)
           
            if(user.failed_login_count<3)
            {
               
              user.account_status='A';
               
            console.log("User Account Status : ",user.account_status);
            console.log("User failed count after increment : ",user.failed_login_count);
            console.log("User lockout time : ",user.lockout_time);
            const Udata = await makeUserLockout(user.user_id,null,user.failed_login_count+1,user.account_status);
            if(Udata instanceof Response)
                return Udata 
            }
           
       
            if(user.failed_login_count>=2)
                {
                    const currentLocoutTime = new Date();
                    currentLocoutTime.setHours(currentLocoutTime.getHours() + 1);
                    user.account_status = "S";
                    const data = await makeUserLockout(user.user_id,currentLocoutTime.toISOString(),0,user.account_status,);
                    return ErrorResponse(HTTP_STATUS_CODE.CONFLICT,`${USERMODULE.LOCK_USER} try after ${currentLocoutTime}`)
                }
                return ErrorResponse( HTTP_STATUS_CODE.CONFLICT,USERMODULE.INVALID_OTP,);
        }    
       
    }

    if(user){
        user.account_status='A';
        const setUser = makeUserLockout(user.user_Id,null,0,user.account_status,);
        const userId = data.user?.id;
            const access_token = data.session?.access_token;
            if(userId&&access_token)
            {
                return SuccessResponse(USERMODULE.USER_VERIFIED,{userId,access_token})  
            }
           
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)      

    }

    if(!user){
        console.log("create user account")
        const userId = data.user?.id;
        const access_token = data.session?.access_token;
        if(userId&&access_token)
        {
            const {data:register,error:registerError}=await RegisterUser(userId,phoneNo)
            if(registerError)
            {
                console.error("Error in creating user",registerError.message)
                return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)
            }
            return SuccessResponse(USERMODULE.SENT_OTP_SUCCESS,{userId,access_token})
        }
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)
       
    }  
}

