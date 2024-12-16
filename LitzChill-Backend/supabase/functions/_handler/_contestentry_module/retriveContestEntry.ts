import { getAllRecords, getOnlyActiveRecords, getStatus, getUserContestWithDisqualified } from "../../_repository/_contestentry_repo/retriveContestEntryRepository.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE, CONETST_ENTRY_SUCCESS_MESSAGE } from "../../_shared/_messages/ContestEntryMsgs.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestId } from "../../_shared/_validation/ContestEntryValidation.ts";

/**
 * This function retrieves contest data based on user type:
 * - For regular users ('U'), it fetches status and records accordingly.
 * - For admins ('A'), it fetches all contest entries.
 * @param req -- It is the request object containing contest and user information.
 * @param param -- The parameters containing contest ID, user ID, and user type.
 * @returns -- The response object indicating success or failure.
 */
export default async function get_Contest_Data(_req: Request, param: Record<string, string>): Promise<Response> {
  try {
    const { id: contestId, user_id: userId, user_type: userType } = param;
     // Validate contestId
    const validatedId = validateContestId(contestId);
    if (validatedId instanceof Response) {
      return validatedId;
    }
    // Handle different user types
    if (userType === 'U') {
      const { statusData, statusError } = await getStatus(userId,contestId);
    // Check for valid statusData and handle errors
      if (!statusData || statusError || !statusData?.status) {
        return ErrorResponse(
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.DATABASE_ERROR);
          }
      // If user is disqualified, show their record and active records
      if (statusData.status === 'Disqualified') {
        const { paginatedData, error } = await getUserContestWithDisqualified(contestId, userId);
        if (error) {
          return ErrorResponse(
            HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.DATABASE_ERROR);
        }
        if (!paginatedData || paginatedData.length === 0) {
          return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,CONETST_ENTRY_ERROR_MESSAGE.INVALID_CONTEST);
        }
        return SuccessResponse(
          HTTP_STATUS_CODE.OK,CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_GET, paginatedData,);
    }
    // If user is active, show only active records
      if (statusData.status === 'Active') {
        const { paginatedData, error } = await getOnlyActiveRecords(contestId);
        if (error) {
          return ErrorResponse(
            HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.DATABASE_ERROR);
        }
        if (!paginatedData || paginatedData.length === 0) {
          return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST, CONETST_ENTRY_ERROR_MESSAGE.INVALID_CONTEST);
        }
        return SuccessResponse(
          HTTP_STATUS_CODE.OK,CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_GET,paginatedData,);
        }
    }
    // If user is an admin, return all records
    if (userType === 'A') {
      const {  paginatedData, error } = await getAllRecords(contestId);
      if (error) {
        return ErrorResponse(
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.DATABASE_ERROR);
      }

      if (!paginatedData || paginatedData.length === 0) {
        return ErrorResponse(
          HTTP_STATUS_CODE.BAD_REQUEST, CONETST_ENTRY_ERROR_MESSAGE.INVALID_CONTEST);
      }

      return SuccessResponse(
        HTTP_STATUS_CODE.OK,CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_GET,paginatedData,);
      }

    // Handle invalid user type
    return ErrorResponse(
      HTTP_STATUS_CODE.BAD_REQUEST,CONETST_ENTRY_ERROR_MESSAGE.INVALID_USER_TYPE);
  } catch (_error) {
    return ErrorResponse(
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}
