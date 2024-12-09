import { ErrorsResponse } from "../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../_shared/_constants/HttpStatusCodes.ts";
import supabase from '../_shared/_config/DbConfig.ts';
import { TABLE_NAMES } from "../_shared/_db_table_details/TableNames.ts";

// withAuthorization Middleware
export const roleBasedAccess = (handler: Function, allowedRoles: string[]) => {
    return async (req: Request) => {
        const user = req.headers.get("Authorization");
        if (!user) {
            return ErrorsResponse(HTTP_STATUS_CODE.UNAUTHORIZED, "Unauthorized: No token provided.");
        }

        const jwt = user.replace("Bearer ", "");
        const { data: userData, error: authError } = await supabase.auth.getUser(jwt);
        if (authError || !userData) {
            return ErrorsResponse(HTTP_STATUS_CODE.UNAUTHORIZED, "Unauthorized: Invalid session or JWT.");
        }

        const id = userData.user.id;
        const { data, error } = await supabase
            .from(TABLE_NAMES.USER_TABLE)
            .select("account_status, lockout_time, user_type")
            .eq("user_id", id)
            .in("account_status", ["A", "S"])  // Only active or suspended accounts
            .single();

        if (error || !data) {
            return ErrorsResponse(HTTP_STATUS_CODE.NOT_FOUND, "User not found.");
        }

        if (data.account_status === "S") {
            return ErrorsResponse(HTTP_STATUS_CODE.FORBIDDEN, `Account deactivated. Try after ${data.lockout_time}`);
        }

        if (!allowedRoles.includes(data.user_type)) {
            return ErrorsResponse(HTTP_STATUS_CODE.FORBIDDEN, "User does not have the required role.");
        }

        // Proceed with the original handler if authorized
        return handler(req);
    };
};
