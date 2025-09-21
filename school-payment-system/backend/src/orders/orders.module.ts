/**
 * School Payment System - Orders Module
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This module configures the orders feature including payment processing,
 * transaction management, webhook handling, and related database schemas.
 * It integrates with the Auth module for JWT-protected endpoints.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from '../schemas/order-status.schema';
import { WebhookLogs, WebhookLogsSchema } from '../schemas/webhook-logs.schema';
import { AuthModule } from '../auth/auth.module';

/**
 * OrdersModule - Payment and transaction management module
 * Handles payment gateway integration, order processing, and transaction queries
 * Provides JWT-protected endpoints for secure payment operations
 */
@Module({
  imports: [
    // Register MongoDB schemas specific to payment processing
    // These schemas work together to provide complete payment tracking
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },             // Basic order information
      { name: OrderStatus.name, schema: OrderStatusSchema }, // Payment status details
      { name: WebhookLogs.name, schema: WebhookLogsSchema }, // Audit logging for webhooks
    ]),
    // Import AuthModule to access JWT authentication services
    // This enables JWT protection on payment endpoints
    AuthModule,
  ],
  controllers: [OrdersController], // Register orders controller for HTTP endpoints
  providers: [OrdersService],      // Register orders service for business logic
  exports: [OrdersService],        // Export service for use in other modules if needed
})
export class OrdersModule {}