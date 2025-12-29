interface CronJobConfig {
  id: string;
  name: string;
  schedule: string; // Cron format: minute hour day month dayOfWeek
  enabled: boolean;
  processor: string;
  config: any;
}

interface ProcessingResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duration: number;
  timestamp: string;
}

class CronJobService {
  private jobs: Map<string, CronJobConfig> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private processingHistory: Map<string, ProcessingResult[]> = new Map();

  constructor() {
    this.initializeDefaultJobs();
  }

  private initializeDefaultJobs() {
    const defaultJobs: CronJobConfig[] = [
      {
        id: 'daily-passenger-processing',
        name: 'Daily Passenger Data Processing',
        schedule: '0 2 * * *', // Every day at 2 AM
        enabled: true,
        processor: 'passengerDataProcessor',
        config: {
          departments: ['Operations'],
          fileTypes: ['csv', 'xlsx'],
          categories: ['Passenger Data']
        }
      },
      {
        id: 'weekly-maintenance-report',
        name: 'Weekly Maintenance Report',
        schedule: '0 8 * * 1', // Every Monday at 8 AM
        enabled: true,
        processor: 'maintenanceDataProcessor',
        config: {
          departments: ['Maintenance'],
          fileTypes: ['xlsx', 'json'],
          categories: ['Maintenance Records']
        }
      },
      {
        id: 'monthly-financial-aggregation',
        name: 'Monthly Financial Aggregation',
        schedule: '0 6 1 * *', // 1st of every month at 6 AM
        enabled: true,
        processor: 'financialDataProcessor',
        config: {
          departments: ['Finance'],
          fileTypes: ['json', 'xlsx'],
          categories: ['Financial Data']
        }
      },
      {
        id: 'hourly-system-cleanup',
        name: 'Hourly System Cleanup',
        schedule: '0 * * * *', // Every hour
        enabled: true,
        processor: 'systemCleanupProcessor',
        config: {
          maxAge: 30, // days
          cleanupTypes: ['temp_files', 'processed_data', 'logs']
        }
      }
    ];

    defaultJobs.forEach(job => {
      this.jobs.set(job.id, job);
      if (job.enabled) {
        this.scheduleJob(job);
      }
    });
  }

  private scheduleJob(job: CronJobConfig) {
    // Parse cron schedule
    const cronParts = job.schedule.split(' ');
    const [minute, hour, _day, _month, _dayOfWeek] = cronParts.map(p => p === '*' ? -1 : parseInt(p));

    const calculateNextRun = (): Date => {
      const now = new Date();
      const next = new Date(now);
      
      // Simple cron parsing - in production, use a proper cron library
      if (minute !== -1) next.setMinutes(minute, 0, 0);
      if (hour !== -1) next.setHours(hour);
      
      // If the scheduled time has passed today, schedule for tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      return next;
    };

    const scheduleNextRun = () => {
      const nextRun = calculateNextRun();
      const delay = nextRun.getTime() - Date.now();
      
      const timeout = setTimeout(async () => {
        await this.executeJob(job.id);
        scheduleNextRun(); // Reschedule for next run
      }, delay);

      this.intervals.set(job.id, timeout);
      
      console.log(`📅 Scheduled job "${job.name}" for ${nextRun.toISOString()}`);
    };

    scheduleNextRun();
  }

  async executeJob(jobId: string): Promise<ProcessingResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    console.log(`🚀 Executing CRON job: ${job.name}`);
    const startTime = Date.now();

    try {
      const result = await this.processJobData(job);
      const duration = Date.now() - startTime;

      const processingResult: ProcessingResult = {
        success: true,
        recordsProcessed: result.recordsProcessed,
        errors: result.errors || [],
        duration,
        timestamp: new Date().toISOString()
      };

      this.addToHistory(jobId, processingResult);
      console.log(`✅ Job "${job.name}" completed successfully. Processed ${result.recordsProcessed} records in ${duration}ms`);
      
      return processingResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const processingResult: ProcessingResult = {
        success: false,
        recordsProcessed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        duration,
        timestamp: new Date().toISOString()
      };

      this.addToHistory(jobId, processingResult);
      console.error(`❌ Job "${job.name}" failed:`, error);
      
      return processingResult;
    }
  }

  private async processJobData(job: CronJobConfig): Promise<{ recordsProcessed: number; errors?: string[] }> {
    // This would integrate with your actual data processing logic
    const processor = this.getProcessor(job.processor);
    return await processor.process(job.config);
  }

  private getProcessor(processorName: string) {
    const processors = {
      passengerDataProcessor: {
        async process(_config: any) {
          // Simulate passenger data processing
          console.log('🚊 Processing passenger data...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
          
          // Mock processing logic
          const recordsProcessed = Math.floor(Math.random() * 10000) + 5000;
          const hasErrors = Math.random() > 0.9; // 10% chance of errors
          
          return {
            recordsProcessed,
            errors: hasErrors ? ['Missing station data for route 2'] : []
          };
        }
      },

      maintenanceDataProcessor: {
        async process(_config: any) {
          console.log('🔧 Processing maintenance data...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const recordsProcessed = Math.floor(Math.random() * 5000) + 2000;
          const hasErrors = Math.random() > 0.85; // 15% chance of errors
          
          return {
            recordsProcessed,
            errors: hasErrors ? ['Incomplete maintenance log for train T-201', 'Invalid timestamp format in row 145'] : []
          };
        }
      },

      financialDataProcessor: {
        async process(_config: any) {
          console.log('💰 Processing financial data...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const recordsProcessed = Math.floor(Math.random() * 3000) + 1000;
          const hasErrors = Math.random() > 0.95; // 5% chance of errors
          
          return {
            recordsProcessed,
            errors: hasErrors ? ['Revenue calculation mismatch in Q1 data'] : []
          };
        }
      },

      systemCleanupProcessor: {
        async process(_config: any) {
          console.log('🧹 Running system cleanup...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const filesProcessed = Math.floor(Math.random() * 100) + 50;
          
          return {
            recordsProcessed: filesProcessed,
            errors: []
          };
        }
      }
    };

    return processors[processorName as keyof typeof processors] || processors.passengerDataProcessor;
  }

  private addToHistory(jobId: string, result: ProcessingResult) {
    if (!this.processingHistory.has(jobId)) {
      this.processingHistory.set(jobId, []);
    }
    
    const history = this.processingHistory.get(jobId)!;
    history.unshift(result); // Add to beginning
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(100);
    }
  }

  // Public API methods
  getAllJobs(): CronJobConfig[] {
    return Array.from(this.jobs.values());
  }

  getJob(jobId: string): CronJobConfig | undefined {
    return this.jobs.get(jobId);
  }

  getJobHistory(jobId: string): ProcessingResult[] {
    return this.processingHistory.get(jobId) || [];
  }

  enableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.enabled = true;
    this.scheduleJob(job);
    return true;
  }

  disableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.enabled = false;
    const interval = this.intervals.get(jobId);
    if (interval) {
      clearTimeout(interval);
      this.intervals.delete(jobId);
    }
    return true;
  }

  async runJobNow(jobId: string): Promise<ProcessingResult> {
    return await this.executeJob(jobId);
  }

  createJob(jobConfig: Omit<CronJobConfig, 'id'>): string {
    const jobId = `custom-${Date.now()}`;
    const job: CronJobConfig = { ...jobConfig, id: jobId };
    
    this.jobs.set(jobId, job);
    
    if (job.enabled) {
      this.scheduleJob(job);
    }
    
    return jobId;
  }

  deleteJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    // Don't allow deletion of system jobs
    if (jobId.startsWith('daily-') || jobId.startsWith('weekly-') || jobId.startsWith('monthly-') || jobId.startsWith('hourly-')) {
      return false;
    }

    this.disableJob(jobId);
    this.jobs.delete(jobId);
    this.processingHistory.delete(jobId);
    return true;
  }

  getNextRunTime(jobId: string): Date | null {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) return null;

    // Parse cron schedule to calculate next run
    const cronParts = job.schedule.split(' ');
    const [minute, hour, _day, _month, _dayOfWeek] = cronParts.map(p => p === '*' ? -1 : parseInt(p));

    const now = new Date();
    const next = new Date(now);
    
    if (minute !== -1) next.setMinutes(minute, 0, 0);
    if (hour !== -1) next.setHours(hour);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }

  getJobStats(): { 
    totalJobs: number; 
    activeJobs: number; 
    completedRuns: number; 
    failedRuns: number;
    lastRunTime?: Date;
  } {
    const allJobs = this.getAllJobs();
    const totalJobs = allJobs.length;
    const activeJobs = allJobs.filter(job => job.enabled).length;
    
    let completedRuns = 0;
    let failedRuns = 0;
    let lastRunTime: Date | undefined;
    
    this.processingHistory.forEach((history) => {
      history.forEach((result) => {
        if (result.success) {
          completedRuns++;
        } else {
          failedRuns++;
        }
        
        const runTime = new Date(result.timestamp);
        if (!lastRunTime || runTime > lastRunTime) {
          lastRunTime = runTime;
        }
      });
    });
    
    return {
      totalJobs,
      activeJobs,
      completedRuns,
      failedRuns,
      lastRunTime
    };
  }
}

// Create singleton instance
const cronJobService = new CronJobService();

// Auto-start monitoring
console.log('🕒 CRON Job Service initialized');
console.log(`📊 Loaded ${cronJobService.getAllJobs().length} jobs`);

export default cronJobService;
export type { CronJobConfig, ProcessingResult };