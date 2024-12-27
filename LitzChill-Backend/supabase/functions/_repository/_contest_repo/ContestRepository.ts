import { ContestModel } from "@model/ContestModel.ts";
import supabase from "@shared/_config/DbConfig.ts";
import { CONTEST_TABLE } from "@shared/_db_table_details/ContestTableFields.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";

/**
 * Creates a new contest and inserts the contest data into the contest table.
 * 
 * @param contest - An object containing the data of the contest to be created.
 * @returns {data, error} - 
 *    - If the contest is successfully created, `data` contains the inserted contest data and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */

export async function createContest(contest:ContestModel) :Promise<{ data: any; error: any }> {

        console.log(`INFO: Creating new Contest with data in repo: `,contest);
         const{data,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .insert(contest)
         .select();
 
          return {data,error};
 }

/**
 * Retrieves all contest details from the contest table.
 * 
 * @returns{data,error}
 *    - If the contests are successfully fetched, `data` contains the list of contest details and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */
 export async function getAllContestDetails() :Promise<{data:any;error:any}> {
        console.log("INFO: Getting All contests data in repo ")
         const{data,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .select(`${CONTEST_TABLE.CONTEST_TITLE},
                  ${CONTEST_TABLE.CONTEST_DESCRIPTION},
                  ${CONTEST_TABLE.CONTEST_START_DATE},
                  ${CONTEST_TABLE.CONTEST_END_DATE},
                  ${CONTEST_TABLE.CONTEST_STATUS},
                  ${CONTEST_TABLE.CONTEST_PRIZE}
              `)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE);  

         return {data,error}; 
 }   

/**
 * Retrieves contest details by contest ID from the contest table.
 * 
 * @param contest_id - The ID of the contest to retrieve.
 * @returns {data, error} - 
 *    - If the contest is successfully fetched, `data` contains the contest details and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */
 export async function getContestDetailsById(contest_id:string) :Promise<{data:any;error:any}> {
    
        console.log("INFO: Getting Contest data by id in repo");
         const{data,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .select('contest_title, description, start_date, end_date, status, prize')
         .eq(CONTEST_TABLE.CONTEST_ID,contest_id)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE).maybeSingle();
      
         return {data,error};
 }

/**
 * Updates contest details by contest ID.
 * 
 * @param contestData - A partial object containing the contest data to update. The object must include the `contest_id` to identify the contest.
 * @returns {data, error} - 
 *    - If the contest is successfully updated, `data` contains the updated contest data and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */
 export async function updateContestById(contestData: Partial<ContestModel>) :Promise<{data:any;error:any}>{
    
        console.log(`INFO: Updating Contest data in repo with data: `,contestData);
         const{data,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update(contestData)
         .eq(CONTEST_TABLE.CONTEST_ID, contestData.contest_id)   
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE).select();

         return {data,error};
 }

/**
 * Soft deletes contest details by contest ID by updating the contest status to "deleted".
 * (The contest is not permanently deleted from the database.)
 * 
 * @param contest_id - The ID of the contest to soft delete.
 * @returns {data, error }- 
 *    - If the contest is successfully soft-deleted, `data` contains the updated contest data and `error` is null.
 *    - If a database error occurs, `data` will be null and `error` will contain the error details.
 */
 export async function deleteContestById(contest_id:string) :Promise<{data:any;error:any}> {
      
        console.log(`INFO: Deleting Contest Data by Id`);
         const{data,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update({status:"deleted"})
         .eq(CONTEST_TABLE.CONTEST_ID,contest_id)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE).select();

         return {data,error};
 }


/**
 * Updates the status of contests based on the current date.
 * - Sets contests with a future start date to 'upcoming'.
 * - Sets contests with an active date range to 'ongoing'.
 * - Sets contests with a past end date to 'completed'.
 * 
 * @async
 * @function updateContestStatusUsingCron
 * @returns {Promise<void>} Resolves when the updates are done.
 */

 export async function updateContestStatusUsingCron():Promise<void> {
        console.info("Updating Contest Status Using Deno Cron");
        const currentDate = new Date();

       
        const { error: upcomingError } = await supabase
          .from('contest')
          .update({ status: 'upcoming' })
          .gt('start_date', currentDate.toISOString())
          .neq('status','deleted'); 
        
      
        const { error: ongoingError } = await supabase
          .from('contest')
          .update({ status: 'ongoing' })
          .lte('start_date', currentDate.toISOString()) 
          .gt('end_date', currentDate.toISOString())
          .neq('status','deleted'); ; 
        
      
        const { error: completeError } = await supabase
          .from('contest')
          .update({ status: 'completed' })
          .lt('end_date', currentDate.toISOString())
          .neq('status','deleted'); ; 

         const _obj= {completeError,ongoingError,upcomingError};
        
 }