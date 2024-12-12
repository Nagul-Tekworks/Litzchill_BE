import { ContestModel } from "../../_model/ContestModel.ts";
import supabase from "../../_shared/_config/DbConfig.ts";
import { CONTEST_TABLE } from "../../_shared/_db_table_details/ContestTableFields.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";

/**
 * Creates a new contest and inserts the contest data into the contest table.
 * 
 * @param contest - An object containing the data of the contest to be created.
 * @returns insertedData, error - 
 *    - If the contest is successfully created, `insertedData` contains the inserted contest data and `error` is null.
 *    - If a database error occurs, `insertedData` will be null and `error` will contain the error details.
 */
export async function createContest(contest:ContestModel) {

        console.log(`INFO: Creating new Contest with data in repo: `,contest);
         const{data:insertedData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .insert(contest)
         .select();
 
          return {insertedData,error};
 }

/**
 * Retrieves all contest details from the contest table.
 * 
 * @returns contestData, error- 
 *    - If the contests are successfully fetched, `contestData` contains the list of contest details and `error` is null.
 *    - If a database error occurs, `contestData` will be null and `error` will contain the error details.
 */
 export async function getAllContestDetails() {
        console.log("INFO: Getting All contests data in repo ")
         const{data:contestData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .select(`${CONTEST_TABLE.CONTEST_TITLE},
                  ${CONTEST_TABLE.CONTEST_DESCRIPTION},
                  ${CONTEST_TABLE.CONTEST_START_DATE},
                  ${CONTEST_TABLE.CONTEST_END_DATE},
                  ${CONTEST_TABLE.CONTEST_STATUS},
                  ${CONTEST_TABLE.CONTEST_PRIZE}
              `)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE);  

         return {contestData,error}; 
 }   

/**
 * Retrieves contest details by contest ID from the contest table.
 * 
 * @param contest_id - The ID of the contest to retrieve.
 * @returns contestData, error - 
 *    - If the contest is successfully fetched, `contestData` contains the contest details and `error` is null.
 *    - If a database error occurs, `contestData` will be null and `error` will contain the error details.
 */
 export async function getContestDetailsById(contest_id:string) {
    
        console.log("INFO: Getting Contest data by id in repo");
         const{data:contestData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .select('contest_title, description, start_date, end_date, status, prize')
         .eq(CONTEST_TABLE.CONTEST_ID,contest_id)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE);
      
         return {contestData,error};
 }

/**
 * Updates contest details by contest ID.
 * 
 * @param contestData - A partial object containing the contest data to update. The object must include the `contest_id` to identify the contest.
 * @returns updatedContest, error - 
 *    - If the contest is successfully updated, `updatedContest` contains the updated contest data and `error` is null.
 *    - If a database error occurs, `updatedContest` will be null and `error` will contain the error details.
 */
 export async function updateContestById(contestData: Partial<ContestModel>) {
    
        console.log(`INFO: Updating Contest data in repo with data: `,contestData);
         const{data:updatedContest,error:updateError}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update(contestData)
         .eq(CONTEST_TABLE.CONTEST_ID, contestData.contest_id)   
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE).select();

         return {updatedContest,updateError};
 }

/**
 * Soft deletes contest details by contest ID by updating the contest status to "deleted".
 * (The contest is not permanently deleted from the database.)
 * 
 * @param contest_id - The ID of the contest to soft delete.
 * @returns deletedData, error - 
 *    - If the contest is successfully soft-deleted, `deletedData` contains the updated contest data and `error` is null.
 *    - If a database error occurs, `deletedData` will be null and `error` will contain the error details.
 */
 export async function deleteContestById(contest_id:string) {
      
        console.log(`INFO: Deleting Contest Data by Id`);
         const{data:deletedData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update({status:"deleted"})
         .eq(CONTEST_TABLE.CONTEST_ID,contest_id)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE).select();

         return {deletedData,error};
 }