import cron from "node-cron";
import CronJob from "../../models/settings/CronJob.js";
import User from "../../models/User.js";
import { autoAllocateDrivers } from "./autoAllocateDrivers.js";

export const scheduleAutoAllocation = () => {
  cron.schedule(
    "*/30 * * * *",
    async () => {
      console.log("[CRON] Running auto-allocation");

      try {
        const companies = await CronJob.find({
          "autoAllocation.enabled": true,
        });
        for (const job of companies) {
            const clientAdmin = await User.findOne({ 
              companyId: job.companyId, 
              role: 'clientadmin' 
            }).select('_id');
            
            if (clientAdmin) {
              await autoAllocateDrivers(job.companyId, clientAdmin._id);
            } else {
              console.warn(`[CRON] No client admin found for company ${job.companyId}`);
            }
          }
          
      } catch (err) {
        console.error("[CRON] Auto allocation failed:", err);
      }
    },
    {
      timezone: process.env.CRON_TIMEZONE || "UTC",
    }
  );
};
