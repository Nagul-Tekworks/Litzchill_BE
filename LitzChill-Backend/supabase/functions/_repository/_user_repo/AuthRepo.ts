import supabase from "../../_shared/_config/DbConfig.ts";
export async function sendOtp(phoneNumber:string) 
{
    const { data,error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });   
      return {data,error}
}

export async function otpVerication(phoneNumber:string,otp:string) 
{
    const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: "sms",
    });
    return {data,error}

}
