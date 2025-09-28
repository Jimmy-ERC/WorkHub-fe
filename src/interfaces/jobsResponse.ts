import type { Job } from "./job.interface";

export interface JobsResponse {
    success: boolean;
    data: Job[];
    message?: string;
}