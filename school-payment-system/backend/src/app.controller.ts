/**
 * School Payment System - Root Application Controller
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This controller handles basic application endpoints like health checks
 * and database connectivity verification.
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController - Root controller for basic application endpoints
 * Provides health check and database status endpoints
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint - GET /
   * Returns a simple message to verify the API is running
   * Used for basic connectivity and uptime monitoring
   * 
   * @returns {string} Welcome message with API status
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Database connectivity check endpoint - GET /test-db
   * Verifies MongoDB connection and returns collection information
   * Useful for monitoring database health and troubleshooting
   * 
   * @returns {Promise<string>} Database connection status and document count
   */
  @Get('test-db')
  async testDatabase(): Promise<string> {
    return this.appService.testDatabaseConnection();
  }
}
