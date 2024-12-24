// import { updateEveryFiveMinuteOtpCount } from "../_repository/_user_repo/UserRepository.ts";
import { routeHandler } from "../_routes/Route_Handler.ts";
import { USER_MODULE_ROUTESs } from "../_routes/UserRoutesAndPaths.ts";
// import { cron} from 'https://deno.land/x/deno_cron/cron.ts';

  Deno.serve(async (req: Request) => {
  
    return await routeHandler(req,USER_MODULE_ROUTESs)
    
    });
    // cron("*/5 * * * *", updateEveryFiveMinuteOtpCount);

