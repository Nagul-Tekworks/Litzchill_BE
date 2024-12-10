import { ContestModel } from "../../_model/ContestModel.ts";
import supabase from "../../_shared/_config/DbConfig.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";

//function for create new contest.
export async function createContest(contest:ContestModel) {

         const{data:insertedData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .insert(contest)
         .select();
 
          return {insertedData,error};
 }

 //function for get all contest details.
 export async function getAllContestDetails() {
         const{data:contestData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .select('contest_title, description, start_date, end_date, status, prize')
         .neq('status',"deleted");  

         return {contestData,error}; 
 }   

 //function for get contest detail by contest id.
 export async function getContestDetailsById(contest_id:string) {
    
         const{data:contestData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .select('contest_title, description, start_date, end_date, status, prize')
         .eq('contest_id',contest_id)
         .neq('status',"deleted");
      
         return {contestData,error};
 }

 //function for update contest details by contestId,
 export async function updateContestById(contestData: Partial<ContestModel>) {
    
         const{data:updatedContest,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update(contestData)
         .eq('contest_id', contestData.contest_id)   
         .neq('status',"deleted").select();

         return {updatedContest,error};
 }

 //function for soft delete contest details by id.
 // (Only updating contest status to deleted not deleting permanentlly).
 export async function deleteContestById(contest_id:string) {
      
         const{data:deletedData,error}=await supabase
         .from(TABLE_NAMES.CONTEST_TABLE)
         .update({status:"deleted"})
         .eq('contest_id',contest_id)
         .neq('status',"deleted").select();

         return {deletedData,error};
 }