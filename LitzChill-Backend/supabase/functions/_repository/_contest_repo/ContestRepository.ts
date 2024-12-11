import { ContestModel } from "../../_model/ContestModel.ts";
import supabase from "../../_shared/_config/DbConfig.ts";
import { CONTEST_TABLE } from "../../_shared/_db_table_details/ContestTableFields.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";

//function for create new contest.
export async function createContest(contest:ContestModel) {

        console.log(`INFO: Creating new Contest with data in repo: `,contest);
         const{data:insertedData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .insert(contest)
         .select();
 
          return {insertedData,error};
 }

 //function for get all contest details.
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

 //function for get contest detail by contest id.
 export async function getContestDetailsById(contest_id:string) {
    
        console.log("INFO: Getting Contest data by id in repo");
         const{data:contestData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .select(`${CONTEST_TABLE.CONTEST_TITLE},
                  ${CONTEST_TABLE.CONTEST_DESCRIPTION},
                  ${CONTEST_TABLE.CONTEST_START_DATE},
                  ${CONTEST_TABLE.CONTEST_END_DATE},
                  ${CONTEST_TABLE.CONTEST_STATUS},
                  ${CONTEST_TABLE.CONTEST_PRIZE}
                `)
         .eq(CONTEST_TABLE.CONTEST_ID,contest_id)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE);
      
         return {contestData,error};
 }

 //function for update contest details by contestId,
 export async function updateContestById(contestData: Partial<ContestModel>) {
    
        console.log(`INFO: Updating Contest data in repo with data: `,contestData);
         const{data:updatedContest,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update(contestData)
         .eq(CONTEST_TABLE.CONTEST_ID, contestData.contest_id)   
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE).select();

         return {updatedContest,error};
 }

 //function for soft delete contest details by id.
 // (Only updating contest status to deleted not deleting permanentlly).
 export async function deleteContestById(contest_id:string) {
      
        console.log(`INFO: Deleting Contest Data by Id`);
         const{data:deletedData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update({status:"deleted"})
         .eq(CONTEST_TABLE.CONTEST_ID,contest_id)
         .neq(CONTEST_TABLE.CONTEST_STATUS,CONTEST_TABLE.CONTEST_DELETE).select();

         return {deletedData,error};
 }