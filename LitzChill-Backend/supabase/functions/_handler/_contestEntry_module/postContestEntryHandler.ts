// deno-lint-ignore-file

import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { ErrorResponse, SuccessResponse } from "../../_responses/Response.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constants/HttpStatusCodes.ts";
import { CONETST_ENTRY_ERROR_MESSAGE, CONETST_ENTRY_SUCCESS_MESSAGE } from "../../_shared/_messages/ContestEntryMsgs.ts";
import ContestEntryModel from "../../_model/contest_entry_model.ts";

import { COMMON_ERROR_MESSAGES } from "../../_shared/_messages/ErrorMessages.ts";
import { validateContestId, validateRequiredFields } from "../../_shared/_validation/ContestEntryValidation.ts";
import { checkExistingEntry, insertContestEntry, validateContest, validateMeme, validateUser } from "../../_repository/_contestEntry_repo/postContestEntryRepo.ts";

export default async function handleSubmitContestEntry(req: Request, param: Record<string, string>) {
    try {
        console.log("[INFO] Starting handleSubmitContestEntry...");

        // Checking user role
        const contestId = param.id;
        console.log(`[INFO] Contest ID received: ${contestId}`);

        // Validate contestId
        const validatedId = validateContestId(contestId);
        if (validatedId instanceof Response) {
            console.error("[ERROR] Invalid contest ID.");
            return validatedId;
        }

        // Parse and validate request body
        const body: ContestEntryModel = await req.json();
        console.log("[INFO] Parsed request body:", body);

        const fields = validateRequiredFields(body);
        if (fields instanceof Response) {
            console.error("[ERROR] Missing required fields.");
            return fields;
        }

        // Add contest_id to the body
        body.contest_id = contestId;
        console.log("[INFO] contest_id added to the body.");

        // Validate contest existence
        console.log("[INFO] Validating contest...");
        const { contestData, errorincontest } = await validateContest(contestId);
        if (errorincontest) {
            console.error("[ERROR] Error validating contest:", errorincontest.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                COMMON_ERROR_MESSAGES.DATABASE_ERROR
            );
        }

        if (!contestData || contestData.length === 0) {
            console.warn("[WARN] Invalid contest ID.");
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                CONETST_ENTRY_ERROR_MESSAGE.INVALID_CONTEST,
            );
        }
        console.log("[INFO] Contest validated successfully.");

        // Validate meme existence
        console.log("[INFO] Validating meme...");
        const { MemeData, errorinmeme } = await validateMeme(body.meme_id);
        if (errorinmeme) {
            console.error("[ERROR] Error validating meme:", errorinmeme.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                COMMON_ERROR_MESSAGES.DATABASE_ERROR
            );
        }

        if (!MemeData || MemeData.length==0) {
            console.warn("[WARN] Invalid meme ID.");
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                CONETST_ENTRY_ERROR_MESSAGE.INVALID_MEME
            );
        }
        console.log("[INFO] Meme validated successfully.");

        // Validate user existence
        console.log("[INFO] Validating user...");
        const { userData, errorinuser } = await validateUser(body.user_id);
        if (errorinuser) {
            console.error("[ERROR] Error validating user:", errorinuser.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                COMMON_ERROR_MESSAGES.DATABASE_ERROR
            );
        }

        if (!userData ||userData.length==0) {
            console.warn("[WARN] Invalid user ID.");
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                CONETST_ENTRY_ERROR_MESSAGE.INVALID_USER,
            );
        }
        console.log("[INFO] User validated successfully.");

        // Check if the contest entry already exists
        console.log("[INFO] Checking for existing contest entry...");
        const { isFound, errorinexist } = await checkExistingEntry(body.contest_id, body.meme_id);
        if (errorinexist) {
            console.error("[ERROR] Error checking existing entry:", errorinexist.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                COMMON_ERROR_MESSAGES.DATABASE_ERROR
            );
        }

        if (isFound && isFound.length>0) {
            console.warn("[WARN] Contest entry already exists.");
            return ErrorResponse(
                HTTP_STATUS_CODE.CONFLICT,
                CONETST_ENTRY_ERROR_MESSAGE.ALLREADY_EXIST,
            );
        }
        console.log("[INFO] No existing contest entry found.");

        // Insert the contest entry into the database
        console.log("[INFO] Inserting new contest entry...");
        const { insertedData, errorininsert } = await insertContestEntry(body);
        if (errorininsert) {
            console.error("[ERROR] Error inserting contest entry:", errorininsert.message);
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                CONETST_ENTRY_ERROR_MESSAGE.ALLREADY_REG,
            );
        }

        if (!insertedData || insertedData.length==0) {
            console.error("[ERROR] No data returned after inserting contest entry.");
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                COMMON_ERROR_MESSAGES.DATABASE_ERROR,
            );
        }
        console.log("[INFO] Contest entry inserted successfully.");

        // Return success response
        return SuccessResponse(
            CONETST_ENTRY_SUCCESS_MESSAGE.SUCESS_POST,
            HTTP_STATUS_CODE.OK
        );

    } catch (error) {
        // Handle unexpected errors
        console.error("[ERROR] Unexpected error in handleSubmitContestEntry:", error);
        return ErrorResponse(
            HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
            COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        );
    }
}
