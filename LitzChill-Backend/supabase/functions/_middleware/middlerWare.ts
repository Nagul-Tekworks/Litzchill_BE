// import ErrorResponse from "../_responses/Response.ts";
// import supabase from "../_shared/_config/DbConfig.ts";
// import { HTTP_STATUS_CODE } from "../_shared/_constants/HttpStatusCodes.ts";

 
// export default async function getUserAuthenticationDetails(req:Request,roles:string[])
// {
//     const user = req.headers.get("Authorization");
//         console.log(user);
//         if (!user) {
//             console.log("First check")
//             return new Response("Unauthorized", { status: 401 });
//         }
 
//         const jwt = user.replace("Bearer ", "");
//         const { data: userData, error: authError } = await supabase.auth
//             .getUser(jwt);
//         if (authError || !userData) {
//             console.log("user session expired")
//             return new Response("Unauthorized", { status: 401 });
//         }
 
//         const id=userData.user.id;
//         const { data, error } = await supabase
//             .from("users")
//             .select('account_status,lockout_time,user_type')
//             .eq("user_id", id)
//             .in("account_status",['A','S'])
//             .single();
 
//             if(error)
//             {
//                // return ErrorResponse(`${error}`,HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
//             }
//             if(!data)
//             {
//                // return ErrorResponse(USERMODULE.USER_NOT_FOUND,HTTP_STATUS_CODE.NOT_FOUND)
//             }
//             if(data.account_status=='S')
//             {
//                 //return ErrorResponse(USERMODULE.ACCOUNT_DEACTIVATED+`Try after ${data.lockout_time}`,HTTP_STATUS_CODE.FORBIDDEN)
//             }
//             if(!roles.includes(data.user_type))
//             {
//                 //return ErrorResponse(USERMODULE.RESTRICTED_USER,STATUSCODE.FORBIDDEN)
//             }
 
//             // const params={
//             //     user_id:id,
//             //     account_status:data.account_status,
//             //     user_type:data.user_type,
//             // }
//             // return params
           
// }