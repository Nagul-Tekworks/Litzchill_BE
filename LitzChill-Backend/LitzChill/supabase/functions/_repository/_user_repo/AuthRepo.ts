import supabase from "../../_shared/_config/DbConfig.ts";
export async function sendOtp(phoneNumber:string) :Promise<{data:any,error:any}>
{
    const { data,error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });   
      return {data,error}
}

export async function otpVerication(phoneNumber:string,otp:string):Promise<{data:any,error:any}> 
{
    const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: "sms",
    });
    return {data,error}

}

export async function logout(token:string,scope:string):Promise<{data:any,error:any}>
{
    if(scope=='local')
    {
        const {data,error}=await supabase.auth.admin.signOut(token as string,'local');
        return {data,error}
    }
    if(scope=='global')
    {
        const {data,error}=await supabase.auth.admin.signOut(token as string,'global')
        return {data,error}
 
    }
    return {data:null,error:null}
    
}

