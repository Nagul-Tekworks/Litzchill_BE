import supabase from "../../_shared/_config/DbConfig.ts";
import { CONTEST_ENTRY_QUERY, CONTEST_ENTRY_TABLE, LIMIT_CONSTANT } from "../../_shared/_db_table_details/contestentrytablefeilds.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";
/**
 * Retrieves the status of a user's contest entry.
 * 
 * This function queries the database to fetch the status of a user's entry in a specific contest.
 * It uses both the contest ID and user ID to identify the entry. The function returns the status data 
 * along with any potential errors encountered during the database query process.
 * 
 * @param userId - The unique identifier of the user whose contest entry status is to be fetched.
 * @param contestId - The unique identifier of the contest for which the status of the user's entry is being fetched.
 * 
 * @returns An object containing:
 * - `statusData`: The status of the user's contest entry, or `null` if no entry is found for the given user and contest.
 * - `statusError`: Any error encountered during the database query, or `null` if no errors occurred.
 */
export async function getStatus(userId: string,contestId:string) :Promise<{statusData:any,statusError:any}>{
 const { data: statusData, error: statusError } = await supabase
    .from(TABLE_NAMES.CONTESTENTRY_TABLE)
    .select("status")
    .eq(CONTEST_ENTRY_TABLE.CONTEST_ID,contestId)
    .eq(CONTEST_ENTRY_TABLE.USER_ID, userId).maybeSingle();
  return { statusData, statusError };
}
/**
 * Retrieves all contest entries for a specific contest.
 * 
 * This function queries the database to fetch all entries for a contest based on the given contest ID.
 * It returns a paginated list of contest entries along with any potential errors encountered during the query.
 * 
 * @param contestId - The unique identifier of the contest for which all entries are to be fetched.
 * 
 * @returns An object containing:
 * - `data`: An array of contest entries, or `null` if no entries are found for the given contest.
 * - `error`: Any error encountered during the database query, or `null` if no errors occurred.
 */
export async function getAllRecords(contestId: string):Promise<{paginatedData:any,error:any}> {
  const { data: paginatedData, error } = await supabase
    .from(TABLE_NAMES.CONTESTENTRY_TABLE)
    .select(CONTEST_ENTRY_QUERY.GET_CONTEST_ENTRY)
    .eq(CONTEST_ENTRY_TABLE.CONTEST_ID, contestId)
    .limit(LIMIT_CONSTANT.RECORD_LIMIT); 
  return { paginatedData, error };
}
/**
 * Retrieves only the active contest entries for a specific contest.
 * 
 * This function queries the database to fetch only the active contest entries based on the provided contest ID.
 * It returns a paginated list of active contest entries along with any potential errors encountered during the query.
 * 
 * @param contestId - The unique identifier of the contest for which active entries are to be fetched.
 * 
 * @returns An object containing:
 * - `data`: An array of active contest entries, or `null` if no active entries are found for the given contest.
 * - `error`: Any error encountered during the database query, or `null` if no errors occurred.
 */
export async function getOnlyActiveRecords(contestId: string):Promise<{paginatedData:any,error:any}> {
 const { data: paginatedData, error } = await supabase
    .from(TABLE_NAMES.CONTESTENTRY_TABLE)
    .select(CONTEST_ENTRY_QUERY.GET_CONTEST_ENTRY)
    .eq(CONTEST_ENTRY_TABLE.CONTEST_ID, contestId)
    .eq(CONTEST_ENTRY_TABLE.STATUS, 'Active')
    .limit(LIMIT_CONSTANT.RECORD_LIMIT);
 return { paginatedData, error };
}
/**
 * Retrieves contest entries for a specific user, including their own entry and all active entries for the contest.
 * 
 * This function queries the database to fetch both the contest entry of a specific user (including disqualified users)
 * and all active entries for the given contest. The results are returned in a paginated format, along with any error that
 * may have occurred during the query.
 * 
 * @param contestId - The unique identifier of the contest for which the entries are to be fetched.
 * @param userId - The unique identifier of the user whose entry is to be fetched along with all active entries for the contest.
 * 
 * @returns An object containing:
 * - `data`: An array of contest entries for the user and all active entries, or `null` if no entries are found.
 * - `error`: Any error encountered during the database query, or `null` if no errors occurred.
 */
export async function getUserContestWithDisqualified(contestId: string, userId: string):Promise<{paginatedData:any,error:any}> {
  const { data: paginatedData, error } = await supabase
    .from(TABLE_NAMES.CONTESTENTRY_TABLE)
    .select(CONTEST_ENTRY_QUERY.GET_CONTEST_ENTRY)
    .eq(CONTEST_ENTRY_TABLE.CONTEST_ID, contestId)
    .or(`user_id.eq.${userId},status.eq.Active`)
  return {paginatedData, error };
}
