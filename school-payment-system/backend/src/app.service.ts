/**
 * School Payment System - Root Application Service
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This service provides basic application functionality including health checks
 * and database connectivity verification for monitoring and debugging.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

/**
 * AppService - Root service for basic application functionality
 * Handles health checks and database status verification
 */
@Injectable()
export class AppService {
  constructor(
    // Inject Order model to test database connectivity
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Basic health check method
   * Returns a welcome message to confirm the API is operational
   * 
   * @returns {string} Welcome message for the School Payment System API
   */
  getHello(): string {
    return 'Hello World! School Payment System API is running successfully.';
  }

  // Test MongoDB connection
  async testDatabaseConnection(): Promise<string> {
    try {
      // Attempt to count documents in the Order collection
      // This operation requires a working database connection
      const count = await this.orderModel.countDocuments();
      return `Database connected successfully! Order collection has ${count} documents.`;
    } catch (error) {
      // Return error message if database connection fails
      return `Database connection failed: ${error.message}`;
    }
  }
}
