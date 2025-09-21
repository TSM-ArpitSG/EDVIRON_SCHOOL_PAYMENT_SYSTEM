/**
 * School Payment System - Order Status Schema
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This schema defines the detailed payment status information for orders.
 * It stores transaction details, payment status, and financial information
 * received from payment gateways via webhooks. Linked to Order schema via collect_id.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Type definition combining OrderStatus class with MongoDB Document
export type OrderStatusDocument = OrderStatus & Document;

/**
 * OrderStatus Schema - MongoDB collection for detailed payment tracking
 * Stores comprehensive payment information including amounts, status, and gateway details
 * Updated via webhooks from payment gateways to reflect real-time payment status
 */
@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt fields
export class OrderStatus {
  /**
   * Reference to the parent Order document
   * Links this status record to the original order for complete payment tracking
   */
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  collect_id: Types.ObjectId;

  /**
   * Original order amount requested
   * The base amount before any fees or adjustments
   */
  @Prop({ required: true })
  order_amount: number;

  /**
   * Final transaction amount processed
   * May include gateway fees, taxes, or other adjustments
   */
  @Prop({ required: true })
  transaction_amount: number;

  /**
   * Payment method used for the transaction
   * Examples: 'credit_card', 'debit_card', 'upi', 'netbanking', etc.
   */
  @Prop({ required: true })
  payment_mode: string;

  /**
   * Detailed payment information from gateway
   * Contains gateway-specific transaction details and metadata
   */
  @Prop({ required: true })
  payment_details: string;

  /**
   * Bank reference number for the transaction
   * Unique identifier from the banking system for tracking and reconciliation
   */
  @Prop({ required: false, default: '' })
  bank_reference: string;

  /**
   * Payment status message from gateway
   * Human-readable message describing the payment result
   */
  @Prop({ required: true })
  payment_message: string;

  /**
   * Current payment status
   * Values: 'success', 'failed', 'pending' - used for filtering and reporting
   */
  @Prop({ required: true })
  status: string;

  /**
   * Error message for failed transactions
   * Contains detailed error information when payment fails
   */
  @Prop({ required: false, default: '' })
  error_message: string;

  /**
   * Timestamp when payment was processed
   * Exact time of payment completion or failure from gateway
   */
  @Prop({ required: true })
  payment_time: Date;
}

// Create MongoDB schema from the OrderStatus class
export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);

// Create performance indexes for frequently queried fields
// These indexes improve query performance for payment reporting and filtering
OrderStatusSchema.index({ collect_id: 1 }); // Index for linking to Order documents
OrderStatusSchema.index({ status: 1 });     // Index for status-based filtering