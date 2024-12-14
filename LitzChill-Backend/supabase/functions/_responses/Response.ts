
/**
 * Function to handle all errors
 * 
 * @param statusCode ->Error status code
 * @param error -> Error Message 
 * @returns {Response}->Error Response 
 * 
 * -Function Will Return Error Response which contains status code ,error message and error time.
 */
export function ErrorResponse(statusCode: number, error: string) :Response {
    const time = new Date();
    return new Response(JSON.stringify({statusCode,error,time}), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * 
 * @param message ->Success Message
 * @param data ->Data Optional parameter
 * @param statusCode ->Success status code default 200(OK).
 * @returns {Response}->Success Response
 * 
 * - Function Returns Success response which contains success message, data optional and status code.  
 */
export function SuccessResponse(message: string, statusCode: number, data?: any) :Response{

    const body = data ? {statusCode, message, data } : { statusCode,message };
    return new Response(
        JSON.stringify({body}),
        {
            status: statusCode,
            headers: { 'content-type':'application/json'},
        }
    );
}
