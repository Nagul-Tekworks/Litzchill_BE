import supabase from "../../_shared/_config/DbConfig.ts";

//This module contains two functions, getContest and update_contest_entry_status, 
//which interact with a Supabase database to fetch and update contest entry data.

export async function getContest(contest_id: string, entry_id: string) {
  const { data: fetchedData, error:errorinfetching } = await supabase
    .from("contest_entry")
    .select("*")
    .eq("contest_id", contest_id)
    .eq("entry_id", entry_id);

  return {fetchedData,errorinfetching}; // Return the data array directly or error
}

export default async function update_contest_entry_status(contest_id: string, entry_id: string, new_status: string) {
  const { data: updatedData, error:errorinupdate} = await supabase
    .from("contest_entry")
    .update({ status: new_status }) // Only update the `status` field
    .eq("contest_id", contest_id)
    .eq("entry_id", entry_id)
    .select(); // Ensure updated rows are returned

  return {updatedData,errorinupdate}; // Return the updated data or error
}
