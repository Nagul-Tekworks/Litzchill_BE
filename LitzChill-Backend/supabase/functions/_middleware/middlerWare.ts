
import ErrorResponse from "../_responses/Response.ts";
import supabase from "../_shared/_config/DbConfig.ts";
import { HTTP_STATUS_CODE } from "../_shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "../_shared/_messages/ErrorMessages.ts";


// function which is wrapped to handler 
export const checkUserAuthentication = function checkUserAuthentication(
    handler: (
        request: Request,
        params: Record<string, string>,
    ) => Promise<Response>,
    roles: string[] = [],
) {
    //function which contain privillege logic 
    return async function (
        req: Request,
        params: Record<string, string>,
    ): Promise<Response> {
        try {
            // Getting token from header
            const token = req.headers.get("Authorization");
            console.log("User Token: ", token);

            //if user not provide token returning error response
            if (!token) {
                console.log("First check");
                return ErrorResponse(
                     HTTP_STATUS_CODE.UNAUTHORIZED,
                     COMMON_ERROR_MESSAGES.MISSING_JWT_TOKEN
                );
            }

            // Getting userData from auth table by token
            const jwt = token.replace("Bearer ", "");
            const { data: userData, error: authError } = await supabase.auth.getUser(jwt);
            if (authError || !userData) {
                console.log("User session expired");
                return ErrorResponse(
                     HTTP_STATUS_CODE.UNAUTHORIZED,
                     COMMON_ERROR_MESSAGES.MISSING_JWT_TOKEN
                );
            }

            // Getting user details from users table by id
            const id = userData.user.id;
            const { data, error } = await supabase
                .from("users")
                .select('account_status,lockout_time,user_type')
                .eq("user_id", id)
                .in("account_status", ['A', 'S'])
                .single();

            if (error) {
                return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     COMMON_ERROR_MESSAGES.DATABASE_ERROR
                );
            }

            if (!data) {
                return ErrorResponse(
                     HTTP_STATUS_CODE.NOT_FOUND,
                     "User Not Found"
                );
            }
            //checking for user account status .
            if (data.account_status === 'S') {
                return ErrorResponse(
                      HTTP_STATUS_CODE.FORBIDDEN,
                     `${COMMON_ERROR_MESSAGES.ACCOUNT_DEACTIVATE}, Try after ${data.lockout_time}`
                );
            }

            // Checking for user role.
            if (!roles.includes(data.user_type)) {
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
            console.log("Valid user");

            //calling handler by passing req and user details.
            return await handler(req, user); 

        } catch (error) {
            console.error(error);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            );
        }
    };
};