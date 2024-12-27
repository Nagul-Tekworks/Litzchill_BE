import {ErrorResponse} from "@response/Response.ts";
import supabase from "@shared/_config/DbConfig.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { USERSTATUS } from "@shared/_constants/Types.ts";
import { Logger } from "@shared/_logger/Logger.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";



/**
 * Middleware to authenticate and authorize users before executing the handler.
 * 
 * Validates JWT token, checks user account status, and ensures the user has the required role(s). 
 * If any check fails, returns an error response. If successful, proceeds with the handler.
 *
 * @param {Function} handler - The handler function to execute after authentication and authorization checks.
 * @param {string[]} [roles=[]] - Array of allowed roles for access. If the user's role isn't included, access is denied.
 * @returns {Promise<Response>} - The result of the handler or an error response.
 */

export const checkUserAuthentication = function checkUserAuthentication(
    handler: (
        request: Request,
        params: Record<string, string>,
    ) => Promise<Response>,
    roles: string[] = [],
) {
   /**
     * Performs authentication and authorization checks before calling the handler.
     * 
     * @param {Request} req - The HTTP request.
     * @param {Record<string, string>} params - Request parameters including param details.
     * @returns {Promise<Response>} - Either the handler result or an error response.
     */

   const logger=Logger.getloggerInstance();
    
    return async function (
        req: Request,
        params: Record<string, string>,
    ): Promise<Response> {
        try {

            logger.info(`User Authorization start`);
            // Getting token from header
            const token = req.headers.get("Authorization");

            //if user not provide token returning error response
            if (!token) {
                logger.error("authentication Token Is missing");
                return ErrorResponse(
                     HTTP_STATUS_CODE.UNAUTHORIZED,
                     COMMON_ERROR_MESSAGES.MISSING_JWT_TOKEN
                );
            }

           
            //Bearer 
            const jwt = token.replace("Bearer ", "");
            logger.info(`Successfully got jwt token ,${jwt}`);


            // Getting userData from auth table by token
            const { data: userData, error: authError } = await supabase.auth.getUser(jwt);
            if (authError || !userData) {
                logger.error(`User Session expired ${authError}`);
                return ErrorResponse(
                     HTTP_STATUS_CODE.UNAUTHORIZED,
                     COMMON_ERROR_MESSAGES.MISSING_JWT_TOKEN
                );
            }

            logger.info(`Successfully Fetched User Data From AUTH Table,${userData.user}`);
            // Getting user details from users table by id
            const id = userData.user.id;

            logger.log(`Use id is: ${id}`);
            //getting user details(account_status,lockout-time ,user_type) from user table.
            const { data, error } = await supabase
                .from('users')
                .select('account_status,lockout_time,user_type')
                .eq("user_id", id)
                .in("account_status", ['A', 'S'])
                .maybeSingle();




            if (error) {
                logger.error(`During Fethcing user info from user Table, ${error.message}`);
                return ErrorResponse(
                     HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                     COMMON_ERROR_MESSAGES.DATABASE_ERROR
                );
            }

           
            if (!data) {
                logger.info(`User not found with user id ${id}`)
                return ErrorResponse(
                     HTTP_STATUS_CODE.NOT_FOUND,
                     COMMON_ERROR_MESSAGES.USER_NOT_FOUND
                );
            }
            //checking for user account status .
            if (data.account_status === USERSTATUS.SUSPENDED) {
                logger.error(`User Account Suspended.`);
                return ErrorResponse(
                      HTTP_STATUS_CODE.FORBIDDEN,
                     `${COMMON_ERROR_MESSAGES.ACCOUNT_DEACTIVATE}, Try after ${data.lockout_time}`
                );
            }

            // Checking for user role.
            if (!roles.includes(data.user_type)) {
                logger.error(`User does not have required privillege.`);
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
            logger.info("Valid user passing controll to handler with req and user params.");

            //calling handler by passing req and user details.
            return await handler(req, user); 

        } catch (error) {
            logger.error(`Internal Server Error while Authorization.${error}`);
            return ErrorResponse(
                 HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                 COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            );
        }
    };
};
