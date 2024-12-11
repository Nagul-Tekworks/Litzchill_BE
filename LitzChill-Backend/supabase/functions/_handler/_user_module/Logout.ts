import supabase from "../../_shared/_config/DbConfig.ts";


import { USERMODULE } from "../../_shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "../../_responses/Response.ts";
import ErrorResponse from "../../_responses/Response.ts";

export default async function logoutUser(req:Request,user:Record<string,string>) {
    
    
    const token =user.token;
    console.log(token);
    const { error } = await supabase.auth.admin.signOut(token as string);
    if (error) {
        console.log("not able to log out");
        return ErrorResponse( HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR,);
    } else {
        return SuccessResponse(USERMODULE.USER_LOGOUT_SUCCESS);
    }
}
