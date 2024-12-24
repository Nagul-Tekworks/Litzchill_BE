import { getFollowers } from "../../_repository/_user_repo/UserRepository.ts";
import ErrorResponse, { SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";



export default async function fetchFollower(req:Request,params:Record<string,string>)
{
    try{
        const user_id=params.user_id;

        const {data,error}=await getFollowers(user_id);
        if(error){
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error.message}`)
        }
        if(!data){
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`not found`)
        }
        console.log(data)

        return SuccessResponse("found",HTTP_STATUS_CODE.OK,data);
        
    }   
    catch(error) 
    {
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,`${error}`)
    }
}