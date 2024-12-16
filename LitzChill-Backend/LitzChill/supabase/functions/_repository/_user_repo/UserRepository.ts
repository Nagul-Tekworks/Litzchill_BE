import supabase from "../../_shared/_config/DbConfig.ts";
import { UserProfile } from '../../_model/UserModel.ts';
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";
import { USER_TABLE_FIELDS } from "../../_shared/_db_table_details/UserTableFields.ts";


/**
 * this method is used to Fetch User profile  based on the user_Id
 *
 * @param id --I takes the user id as a parameter
 * @returns -- It will return user data or error
 */
export async function getUserProfile(id: string) :Promise<{data:any,error:any}>{
  console.log("fetching start");
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .select('*')
    .eq(USER_TABLE_FIELDS.USER_ID, id).maybeSingle();

  return { data, error };

}
/**
 * This method is used to get user through phone number
 * @param phoneNo --It takes phone number as the parameter
 * @returns --It will return Response Object or User Profile
 */

export async function getUser(phoneNo: string) :Promise<{data:any,error:any}>{
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .select("*")
    .eq(USER_TABLE_FIELDS.MOBILE, phoneNo)  // .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
    .maybeSingle();
    return { data, error };
   
   
}

/**
 * This method is used to update user profile and it will return updated user data
 * @param profile -- It takes the UserProfile type variable as parameter to Update user profile
 * @param user_id -- user_id used to update user user profile based on user_id
 * @returns -- It will return updated user profile or Response object
 */

export async function updateProfile(profile: UserProfile, user_id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update(profile)
    .eq(USER_TABLE_FIELDS.USER_ID, user_id)
    .eq(USER_TABLE_FIELDS.ACCOUNT_STATUS, "A")
    .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
    .select("*")
    .maybeSingle();
  return { data, error };
}

/**
 * This method is used to update user lockout_time, account_status, faild _login_count based on user_id
 * 
 * @param user_Id -- It is user_id of type string
 * @param lockout_time --It can be eigther null or Date type
 * @param failed_login_count --It is a number type
 * @param account_status --It can be either 'A'||'S'
 * @returns --It will return response Object or Updated user data
 */

export async function makeUserLockout(
  user_Id: string,
  lockout_time: string | null,
  failed_login_count: number,
  account_status: string,
) :Promise<{data:any,error:any}>{
  console.log("Failed Login count", failed_login_count);
  console.log("User id is :", user_Id);
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update({
      [USER_TABLE_FIELDS.ACCOUNT_STATUS]: account_status,
      [USER_TABLE_FIELDS.LOCKOUT_TIME]: lockout_time,
      [USER_TABLE_FIELDS.FAILED_LOGIN_COUNT]: failed_login_count
    })
    .eq(USER_TABLE_FIELDS.USER_ID, user_Id).select().maybeSingle();
    return { data, error };
}
/**
 * This method is used to create new user account
 * 
 * @param user_id --It is user user_id of type string(uuid)
 * @param phoneNo --It is user phone number
 * @returns -- It will return data or error
 */
export async function RegisterUser(user_id: string, phoneNo: string) :Promise<{data:any,error:any}>{
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .insert({
      [USER_TABLE_FIELDS.USER_ID]: user_id,
      [USER_TABLE_FIELDS.MOBILE]: phoneNo,
      [USER_TABLE_FIELDS.ACCOUNT_VERIFIED]: { email: false, phone: true },
      [USER_TABLE_FIELDS.ACCOUNT_STATUS]:'A',
      [USER_TABLE_FIELDS.USER_TYPE]:'U'
    }).maybeSingle();
  return { data, error }
}


/**
 * This method is used to deactivate account by user_id
 * @param user_Id --It is user user_id of type string(uuid)
 * @returns --It will return Response object
 */

export async function updateUserStatus(user_Id: string,account_status:string) :Promise<{data:any,error:any}>{
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update({ [USER_TABLE_FIELDS.ACCOUNT_STATUS]: account_status })
    .eq(USER_TABLE_FIELDS.USER_ID, user_Id)
    .select('*')
    .maybeSingle();
    return { data, error };
}