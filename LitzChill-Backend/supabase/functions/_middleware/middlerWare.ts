import ErrorResponse from "../_responses/Response.ts";
import supabase from "../_shared/_config/DbConfig.ts";
import { HTTP_STATUS_CODE } from "../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../_shared/_messages/ErrorMessages.ts";


// function which is wrapped pver to all handler 
export const checkUserAuthentication = function checkUserAuthentication(
    handler: (
        request: Request,
        params: Record<string, string>,
    ) => Promise<Response>,
    roles: string[] = [],
) {
    //function which contain privillege logic and execute before handler 
    return async function (
        req: Request,
        params: Record<string, string>,
    ): Promise<Response> {
        try {
            console.log("INFO: User Authorization start");
            // Getting token from header
            const token = req.headers.get("Authorization");

            //if user not provide token returning error response
            if (!token) {
                console.error("ERROR: Token Is Required");
                return ErrorResponse(
                     HTTP_STATUS_CODE.UNAUTHORIZED,
                     COMMON_ERROR_MESSAGES.MISSING_JWT_TOKEN
                );
            }

           
            const jwt = token.replace("Bearer ", "");
            console.log("INFO: Successfully got jwt token ",jwt);

            // Getting userData from auth table by token
            const { data: userData, error: authError } = await supabase.auth.getUser(jwt);
            if (authError || !userData) {
                console.error(`ERROR: User Session expired ${authError}`);
                return ErrorResponse(
                     HTTP_STATUS_CODE.UNAUTHORIZED,
                     COMMON_ERROR_MESSAGES.MISSING_JWT_TOKEN
                );
            }

            console.log("INFO: Successfully Fetched User Data From AUTH Table",userData);
            // Getting user details from users table by id
            const id = userData.user.id;
            const { data, error } = await supabase
                .from("users")
                .select('account_status,lockout_time,user_type')
                .eq("user_id", id)
                .in("account_status", ['A', 'S'])
                .single();

            if (error) {
                console.error("ERROR: During Fethcing user info from user Table.",error.message);
                return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     COMMON_ERROR_MESSAGES.DATABASE_ERROR
                );
            }

            if (!data) {
                return ErrorResponse(
                     HTTP_STATUS_CODE.NOT_FOUND,
                     COMMON_ERROR_MESSAGES.USER_NOT_FOUND
                );
            }
            //checking for user account status .
            if (data.account_status === 'S') {
                console.error("ERROR: User Account Suspended.");
                return ErrorResponse(
                      HTTP_STATUS_CODE.FORBIDDEN,
                     `${COMMON_ERROR_MESSAGES.ACCOUNT_DEACTIVATE}, Try after ${data.lockout_time}`
                );
            }

            // Checking for user role.
            if (!roles.includes(data.user_type)) {
                console.error("ERROR: User does not have required privillege.");
                return ErrorResponse(
                     HTTP_STATUS_CODE.FORBIDDEN,
                     COMMON_ERROR_MESSAGES.UNAUTHORIZED_ACCESS
                );
            }

            // If the user has access permission, passing user details to the handler.
            const user = {
                ...params,
                user_id: id,
                account_status: data.account_status,
                user_type: data.user_type,
                token: jwt
            };
            console.log("INFO: Valid user passing controll to handler with req and user params.");

            //calling handler by passing req and user details.
            return await handler(req, user); 

        } catch (error) {
            console.error("ERROR: Internal Server Error while Authorization.",error);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            );
        }
    };
};