import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("uptime-monitor") 
export class UptimeProcessor extends WorkerHost {
   async process(job: Job)  {
    console.log("Procesando job: ", job.data);
   }  
}