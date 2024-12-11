import supabase from "../../_shared/_config/DbConfig.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";



/*
  Function to add like to notifications list
*/
export async function addNotifications(user_id: string,meme_title: string,type : string,meme_status: string) {
    const notificationContent = `Your meme "${meme_title}" is "${meme_status}!`;
    console.log(notificationContent+'\n'+user_id+type);
    const { data,error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS_TABLE)
        .insert({
            user_id: user_id,
            content: notificationContent,
            type: type,
            created_at: new Date().toISOString(),
            read_status: false,
        })
        .select("*");
    console.log(data);
    if(error || !data) return null;
    return data;
}

/*
 Function to get notifications of a user
*/

export async function getNotificationsQuery(user_id: string) {
    const { data, error } = await supabase
    .from(TABLE_NAMES.NOTIFICATIONS_TABLE)
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(5);

    if(error || !data) return null;
    return data;
}

/*
Fetch Notifications
*/

export async function existingNotificationsQuery(notification_id: string) {
    const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("notification_id", notification_id)
    .single();

    if(error || !data) return null;
    return data;
}


/*
 Function to mark notifications as read
*/
export async function markNotificationsAsReadQuery(notification_id: string) {
    const { error } = await supabase
    .from("notifications")
    .update({ read_status: true })
    .eq('notification_id', notification_id);

    if(error) return null;
    return true;
}