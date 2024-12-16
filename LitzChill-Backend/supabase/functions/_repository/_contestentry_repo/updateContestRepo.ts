import supabase from "../../_shared/_config/DbConfig.ts";
import { CONTEST_ENTRY_TABLE } from "../../_shared/_db_table_details/contestentrytablefeilds.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";


/**
 * Fetches a specific contest entry based on the provided contest ID and entry ID.
 * 
 * @param contest_id - The ID of the contest to filter records.
 * @param entry_id - The ID of the entry to filter records.
 * @returns - An object containing:
 *            - `fetchedData`: The fetched contest entry data, or null if not found.
 *            - `errorinfetching`: Any error that occurred during the database query.
 */

export async function getContestEntry(contest_id: string, entry_id: string) :Promise<{fetchedData:any,errorInFetching:any}>{
  const { data: fetchedData, error:errorInFetching } = await supabase
    .from(TABLE_NAMES.CONTESTENTRY_TABLE)
    .select("*")
    .eq(CONTEST_ENTRY_TABLE.CONTEST_ID, contest_id)
    .eq(CONTEST_ENTRY_TABLE.ENTRY_ID, entry_id);

  return {fetchedData,errorInFetching}; // Return the data array directly or error
}
/**
 * Updates the status of a specific contest entry based on the provided contest ID and entry ID.
 * 
 * @param contest_id - The ID of the contest containing the entry to be updated.
 * @param entry_id - The ID of the entry to update.
 * @param new_status - The new status value to set for the entry.
 * @returns - An object containing:
 *            - `updatedData`: The updated contest entry data, or null if no rows were updated.
 *            - `errorinupdate`: Any error that occurred during the update operation.
 */

export default async function update_contest_entry_status(contest_id: string, entry_id: string, new_status: string):Promise<{updatedData:any,errorinupdate:any}> {
  const { data: updatedData, error:errorinupdate} = await supabase
    .from(TABLE_NAMES.CONTESTENTRY_TABLE)
    .update({ status: new_status }) // Only update the `status` field
    .eq(CONTEST_ENTRY_TABLE.CONTEST_ID, contest_id)
    .eq(CONTEST_ENTRY_TABLE.ENTRY_ID, entry_id)
    .select(); // Ensure updated rows are returned
  return {updatedData,errorinupdate}; // Return the updated data or error
}
