import { HTTP_STATUS_CODE } from "../_shared/_constants/HttpStatusCodes.ts";

//common error response 
export default function ErrorsResponse(statusCode: number, message: string){
    const time = new Date();
    return new Response(JSON.stringify({statusCode,message,time}), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
    });
}

//
export function SuccessResponse(message: string, data?: any, statusCode: number =HTTP_STATUS_CODE.OK){

    const body = data ? {statusCode, message, data } : { statusCode,message };
    return new Response(
        JSON.stringify({body}),
        {
            status: statusCode,
            headers: { 'content-type':'application/json'},
        }
    );
}
