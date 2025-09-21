/**
 * School Payment System - Root Application Module
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This is the root module that configures and wires together all application modules,
 * database connections, environment configuration, and schema registrations.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from './schemas/order-status.schema';
import { User, UserSchema } from './schemas/user.schema';
import { WebhookLogs, WebhookLogsSchema } from './schemas/webhook-logs.schema';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';

/**
 * AppModule - Root module of the application
 * Configures environment variables, database connection, and imports all feature modules
 */
@Module({
  imports: [
    // Configure environment variables globally for the entire application
    // This allows all modules to access process.env variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally without importing in each module
    }),
    
    // Configure MongoDB Atlas connection using Mongoose
    // Connection string and database name are loaded from environment variables
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_payment_db', {
      dbName: process.env.DATABASE_NAME || 'school_payment_db', // Specify database name
    }),
    
    // Register all MongoDB schemas at the root level for global access
    // This makes the schemas available to all modules that need them
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },             // Order schema for payment orders
      { name: OrderStatus.name, schema: OrderStatusSchema }, // OrderStatus schema for payment status tracking
      { name: User.name, schema: UserSchema },               // User schema for authentication
      { name: WebhookLogs.name, schema: WebhookLogsSchema }, // WebhookLogs schema for audit logging
    ]),
    
    // Import feature modules
    AuthModule,   // Handles user authentication and JWT tokens
    OrdersModule, // Handles payment orders, transactions, and webhooks
  ],
  controllers: [AppController], // Root controller for basic app endpoints
  providers: [AppService],      // Root service for basic app functionality
})
export class AppModule {}
