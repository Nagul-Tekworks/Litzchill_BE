import supabase from "../../_shared/_config/DbConfig.ts";



/*
  Function to add like to notifications list
*/
export async function addNotifications(user_id: string,meme_title: string,type : string) {
    const notificationContent = `Your meme "${meme_title}" received a new like!`;
    const { data,error } = await supabase
        .from("notifications")
        .insert({
            user_id: user_id,
            content: notificationContent,
            type: type,
            created_at: new Date().toISOString(),
            read_status: false,
        });

    if(error || !data) return null;
    return data;
}

/*
 Function to get notifications of a user
*/

export async function getNotificationsQuery(user_id: string) {
    const { data, error } = await supabase
    .from("notifications")
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