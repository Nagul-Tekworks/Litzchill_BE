
//The getContestById function is an asynchronous utility for retrieving data from a Supabase database.
// It queries the contest_entry table, joining data from related tables (contest and memes), 
//based on a specified contest ID.

import supabase from "../../_shared/_config/DbConfig.ts";


export default async function getContestById(contestId: string) {
 
  const { data, error } = await supabase
   .from("contest_entry")
   .select(`
     *,
   contest(*),
     memes(*)
   `)
  
  .eq("contest_id", contestId);
  return {data,error};
 
}
