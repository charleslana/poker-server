import { CronJob } from 'cron';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);

  public start() {
    this.increaseStaminaJob();
    this.adjustStaminaJob();
  }

  private increaseStaminaJob(): void {
    new CronJob(
      '0 */4 * * * *',
      async () => {
        this.logger.log('Increase stamina every 4 minutes');
        try {
          this.logger.log('Stamina updated successfully for all users');
        } catch (error) {
          this.logger.error('Error updating stamina:', error);
        }
      },
      'America/Sao_Paulo'
    ).start();
  }

  private adjustStaminaJob(): void {
    new CronJob(
      '0 */2 * * * *',
      async () => {
        this.logger.log('Adjust stamina if exceeds max every 2 minutes');
        try {
          this.logger.log('Stamina adjusted successfully for all users');
        } catch (error) {
          this.logger.error('Error adjusting stamina:', error);
        }
      },
      'America/Sao_Paulo'
    ).start();
  }
}
