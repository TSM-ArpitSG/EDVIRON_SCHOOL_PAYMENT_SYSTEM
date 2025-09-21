/**
 * School Payment System - Webhook Logs Schema
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This schema defines the audit logging structure for webhook events.
 * It captures all incoming webhook data for compliance, debugging, and monitoring
 * purposes. Essential for tracking payment gateway communications and troubleshooting.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Type definition combining WebhookLogs class with MongoDB Document
export type WebhookLogsDocument = WebhookLogs & Document;

/**
 * WebhookLogs Schema - MongoDB collection for webhook audit logging
 * Stores comprehensive logs of all webhook events for audit trails and debugging
 * Critical for compliance, troubleshooting payment issues, and monitoring gateway health
 */
@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt fields
export class WebhookLogs {
  /**
   * Type of webhook event received
   * Categorizes the webhook for filtering and analysis
   * Examples: 'payment_update', 'refund_processed', 'transaction_failed'
   */
  @Prop({ required: true })
  event_type: string;

  /**
   * Complete webhook payload data
   * Stores the entire JSON payload received from the payment gateway
   * Essential for debugging, compliance, and data recovery scenarios
   */
  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  /**
   * Processing status of the webhook
   * Tracks the lifecycle of webhook processing for monitoring
   * Values: 'received', 'processed', 'failed' - helps identify processing issues
   */
  @Prop({ required: true, default: 'received' })
  status: string;

  /**
   * Timestamp when webhook was processed
   * Records the exact time of webhook handling for performance analysis
   * Used for tracking processing delays and system performance metrics
   */
  @Prop({ required: true })
  processed_at: Date;

  /**
   * Error message for failed webhook processing
   * Captures detailed error information when webhook processing fails
   * Essential for debugging integration issues and system monitoring
   */
  @Prop({ required: false })
  error_message?: string;
}

// Create MongoDB schema from the WebhookLogs class
export const WebhookLogsSchema = SchemaFactory.createForClass(WebhookLogs);

// Create performance indexes for audit queries and monitoring
// These indexes enable efficient log analysis and webhook monitoring
WebhookLogsSchema.index({ event_type: 1 });    // Index for filtering by event type
WebhookLogsSchema.index({ processed_at: -1 }); // Index for time-based queries (descending)
WebhookLogsSchema.index({ status: 1 });        // Index for status-based filtering
