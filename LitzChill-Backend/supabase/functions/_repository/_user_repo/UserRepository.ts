import supabase from "../../_shared/_config/DbConfig.ts";
import { UserProfile } from '../../_model/UserModel.ts';
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "../../_responses/Response.ts";
import ErrorResponse from "../../_responses/Response.ts";
import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";

/**
 * this method is used to get user profile  based on the user_Id
 *
 * @param id
 * @returns
 */
export async function getUserProfile(id: string) {
  console.log("fetching start");
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', id);

  return { userData, userError };

}

/**
 * This method is used to fetch user mobile number for checking wether the user is new user or not
 *
 * @param phno
 * @returns
 */

export async function verify_user(phno: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("mobile", phno)
    .single();
  if (error) {
    return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error}`);
  }

  return data;
}

/**
 * This method is used to get user through phone number
 *
 * @param phoneNo
 * @returns
 */

export async function getUser(phoneNo: string) {
  const { data, error } = await supabase
    .from("users") // Specify the 'users' table and its type
    .select("*")
    .eq("mobile", phoneNo)  // .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
    .maybeSingle();
    // .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
   
 
  if (error) {

    return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error.message}`);
  }
 
  return data;
}

/**
 * This method is used to update user profile and it will return updated user data
 * @param profile
 * @param user_id
 * @returns
 */

export async function updateProfile(profile: UserProfile, user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .update(profile)
    .eq("user_id", user_id)
    .eq("account_status", "A")
    .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
    .select("*")
    .single();

  if (error) {
    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error}`);
  } else if (data == null) {
    return ErrorResponse( HTTP_STATUS_CODE.FORBIDDEN,USERMODULE.USER_NOT_FOUND,);
  } else {
    return data;
  }
}
/**
 * This method is used to update user account status
 *
 * @param user_Id --
 * @param lockout_time
 * @param faild_login_count
 * @returns
 */

export async function makeUserLockout(
  user_Id: string,
  lockout_time: string | null,
  failed_login_count: number,
  account_status: string,
) {
  console.log("Failed Login count", failed_login_count);
  console.log("User id is :", user_Id);
  const { data: userData, error } = await supabase
    .from('users')
    .update({
      'account_status': account_status,
      'lockout_time': lockout_time,
      'failed_login_count': failed_login_count
    })
    .eq('user_id', user_Id).select();
  if (error) {
    return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error}`);
  }
  console.log("lockout count data", userData)
  return userData;

}
/**
 * This method is used to create new user account
 * 
 * @param user_id --user user id
 * @param phoneNo --user phone number
 * @returns 
 */
export async function RegisterUser(user_id: string, phoneNo: string) {
  const { data, error } = await supabase
    .from("users")
    .insert({
      "user_id": user_id,
      "mobile": phoneNo,
      "account_verified": { email: false, phone: true },
      "account_status":'A',
      "user_type":'U'
    }).single();
  return { data, error }
}


export async function DeactivateUser(user_Id: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ 'account_status': 'S' })
    .eq('user_id', user_Id)
    .select('*')
    .single();

    
  if (error) {
    return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error}`,)
  }
  if (!data) {
    return ErrorResponse( HTTP_STATUS_CODE.NOT_FOUND,USERMODULE.USER_NOT_FOUND)
  }
  return SuccessResponse(USERMODULE.ACCOUNT_DEACTIVATED)


}