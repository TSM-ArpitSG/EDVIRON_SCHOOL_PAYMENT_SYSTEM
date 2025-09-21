/**
 * School Payment System - Orders Service
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This service handles the core business logic for payment processing including:
 * - Payment creation with Edviron API integration
 * - Webhook processing and order status updates
 * - Transaction retrieval with filtering, pagination, and sorting
 * - MongoDB aggregation pipelines for complex queries
 * - Comprehensive audit logging and error handling
 */

import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { WebhookLogs, WebhookLogsDocument } from '../schemas/webhook-logs.schema';

/**
 * OrdersService - Core payment processing business logic
 * Handles payment gateway integration, order management, and transaction queries
 */
@Injectable()
export class OrdersService {
  constructor(
    // Inject MongoDB models for database operations
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    @InjectModel(WebhookLogs.name) private webhookLogsModel: Model<WebhookLogsDocument>,
  ) {}

  /**
   * Test method to verify service is working
   * Simple health check for the orders service
   * 
   * @returns {Promise<string>} Success message
   */
  async getTestMessage(): Promise<string> {
    return 'Orders service is working!';
  }

  /**
   * Create payment using real Edviron Payment API
   * Integrates with external payment gateway to process payments
   * Creates order records and initiates payment flow
   * 
   * @param paymentData - Payment information including amount and student details
   * @returns {Promise<object>} Payment creation response with payment URL
   */
  async createPayment(paymentData: any): Promise<any> {
    try {
      // Create order in our database first
      const customOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const order = new this.orderModel({
        school_id: process.env.SCHOOL_ID || '65b0e6293e9f76a9694d84b4', // From assessment credentials
        trustee_id: paymentData.trustee_id || '65b0e552dd31950a9b41c5ba',
        student_info: paymentData.student_info,
        gateway_name: 'Edviron',
        custom_order_id: customOrderId,
      });

      await order.save();

      // Create initial order status
      const orderStatus = new this.orderStatusModel({
        collect_id: order._id,
        order_amount: paymentData.amount,
        transaction_amount: paymentData.amount,
        payment_mode: 'pending',
        payment_details: 'Payment initiated',
        bank_reference: '',
        payment_message: 'Payment in progress',
        status: 'pending',
        error_message: '',
        payment_time: new Date(),
      });

      await orderStatus.save();

      // Prepare JWT payload for Edviron API
      const jwtPayload = {
        school_id: process.env.SCHOOL_ID || '65b0e6293e9f76a9694d84b4',
        amount: paymentData.amount.toString(),
        callback_url: paymentData.callback_url || 'https://google.com',
      };

      // Sign JWT with PG key from environment
      const jwtToken = jwt.sign(jwtPayload, process.env.PAYMENT_PG_KEY || 'edvtest01');

      // Call Edviron Payment API
      const edvironPayload = {
        school_id: process.env.SCHOOL_ID || '65b0e6293e9f76a9694d84b4',
        amount: paymentData.amount.toString(),
        callback_url: paymentData.callback_url || 'https://google.com',
        sign: jwtToken,
      };

      const response = await axios.post(
        'https://dev-vanilla.edviron.com/erp/create-collect-request',
        edvironPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PAYMENT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0'}`,
          },
        }
      );

      return {
        success: true,
        message: 'Payment created successfully. Redirect user to payment URL.',
        order: {
          id: order._id,
          custom_order_id: customOrderId,
          amount: paymentData.amount,
          student_info: paymentData.student_info,
        },
        payment_gateway_response: response.data,
        payment_url: response.data.collect_request_url,
        collect_request_id: response.data.collect_request_id,
      };
    } catch (error) {
      throw new BadRequestException(`Payment creation failed: ${error.response?.data || error.message}`);
    }
  }

  /**
   * Handle webhook payload from payment gateway
   * Updates order status based on webhook data
   * 
   * @param webhookPayload - Webhook payload from payment gateway
   * @returns {Promise<object>} Webhook processing response
   */
  async handleWebhook(webhookPayload: any): Promise<any> {
    try {
      // Log webhook event for auditing
      const webhookLog = new this.webhookLogsModel({
        event_type: 'payment_update',
        payload: JSON.stringify(webhookPayload),
        status: 'received',
        processed_at: new Date(),
      });

      await webhookLog.save();

      const { order_info } = webhookPayload;
      
      // Find order by custom_order_id (webhook uses our custom order ID)
      const order = await this.orderModel.findOne({
        custom_order_id: order_info.order_id
      });

      if (!order) {
        // Update webhook log with error
        webhookLog.status = 'failed';
        webhookLog.error_message = 'Order not found';
        await webhookLog.save();
        
        return {
          success: false,
          message: 'Order not found',
          order_id: order_info.order_id,
        };
      }

      // Update order status with webhook data
      const updatedOrderStatus = await this.orderStatusModel.findOneAndUpdate(
        { collect_id: order._id },
        {
          order_amount: order_info.order_amount,
          transaction_amount: order_info.transaction_amount,
          payment_mode: order_info.payment_mode,
          payment_details: order_info.payemnt_details, // Note: typo in webhook payload as per assessment
          bank_reference: order_info.bank_reference,
          payment_message: order_info.Payment_message,
          status: order_info.status,
          error_message: order_info.error_message || '',
          payment_time: new Date(order_info.payment_time),
        },
        { new: true }
      );

      // Update webhook log as processed
      webhookLog.status = 'processed';
      await webhookLog.save();

      return {
        success: true,
        message: 'Webhook processed successfully',
        order: {
          id: order._id,
          custom_order_id: order.custom_order_id,
          status: order_info.status,
        },
        updated_order_status: updatedOrderStatus,
      };
    } catch (error) {
      return {
        success: false,
        message: `Webhook processing failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Get all transactions with pagination and filters
   * Retrieves transactions based on provided filters and pagination parameters
   * 
   * @param filters - Filters for transaction retrieval
   * @returns {Promise<object>} Transaction retrieval response with pagination
   */
  async getAllTransactions(filters: any): Promise<any> {
    try {
      const { page, limit, status, paymentMode, startDate, endDate, sortBy, sortOrder } = filters;
      
      // Validate pagination parameters
      if (page < 1) {
        throw new BadRequestException('Page number must be greater than 0');
      }
      
      if (limit < 1) {
        throw new BadRequestException('Limit must be greater than 0');
      }
      
      if (limit > 100) {
        throw new BadRequestException('Limit cannot exceed 100 records per page');
      }
      
      const skip = (page - 1) * limit;

      // Build match conditions
      const matchConditions: any = {};
      
      if (status) {
        matchConditions['orderStatus.status'] = status;
      }
      
      if (paymentMode) {
        matchConditions['orderStatus.payment_mode'] = paymentMode;
      }
      
      if (startDate || endDate) {
        matchConditions['orderStatus.payment_time'] = {};
        if (startDate) {
          // Start of the day (00:00:00)
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchConditions['orderStatus.payment_time']['$gte'] = start;
        }
        if (endDate) {
          // End of the day (23:59:59.999) - INCLUSIVE
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchConditions['orderStatus.payment_time']['$lte'] = end;
        }
      }

      // Build sort object
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const aggregationPipeline = [
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'orderStatus'
          }
        },
        {
          $unwind: {
            path: '$orderStatus',
            preserveNullAndEmptyArrays: true
          }
        },
        ...(Object.keys(matchConditions).length > 0 ? [{ $match: matchConditions }] : []),
        {
          $project: {
            collect_id: '$_id', // Assessment requirement
            school_id: 1, // Assessment requirement
            gateway: '$gateway_name', // Assessment requirement (mapped from gateway_name)
            order_amount: '$orderStatus.order_amount', // Assessment requirement
            transaction_amount: '$orderStatus.transaction_amount', // Assessment requirement
            status: '$orderStatus.status', // Assessment requirement
            custom_order_id: 1, // Assessment requirement
            // Additional useful fields for frontend
            student_info: 1,
            payment_mode: '$orderStatus.payment_mode',
            payment_time: '$orderStatus.payment_time',
            payment_message: '$orderStatus.payment_message',
            createdAt: 1
          }
        },
        { $sort: sortObj },
        { $skip: skip },
        { $limit: limit }
      ];

      const transactions = await this.orderModel.aggregate(aggregationPipeline);
      
      // Get total count for pagination
      const countPipeline = [
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'orderStatus'
          }
        },
        {
          $unwind: {
            path: '$orderStatus',
            preserveNullAndEmptyArrays: true
          }
        },
        ...(Object.keys(matchConditions).length > 0 ? [{ $match: matchConditions }] : []),
        { $count: 'total' }
      ];

      const totalResult = await this.orderModel.aggregate(countPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      return {
        success: true,
        data: transactions,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          records_per_page: limit
        }
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Get transactions for specific school
   * Retrieves transactions for a specific school based on provided filters and pagination parameters
   * 
   * @param schoolId - ID of the school
   * @param filters - Filters for transaction retrieval
   * @returns {Promise<object>} Transaction retrieval response with pagination
   */
  async getSchoolTransactions(schoolId: string, filters: any): Promise<any> {
    try {
      const { page, limit, status, paymentMode, startDate, endDate, sortBy, sortOrder } = filters;
      
      // Validate pagination parameters
      if (page < 1) {
        throw new BadRequestException('Page number must be greater than 0');
      }
      
      if (limit < 1) {
        throw new BadRequestException('Limit must be greater than 0');
      }
      
      if (limit > 100) {
        throw new BadRequestException('Limit cannot exceed 100 records per page');
      }
      
      const skip = (page - 1) * limit;

      // Build match conditions (include school filter)
      const matchConditions: any = {
        school_id: schoolId
      };
      
      if (status) {
        matchConditions['orderStatus.status'] = status;
      }
      
      if (paymentMode) {
        matchConditions['orderStatus.payment_mode'] = paymentMode;
      }
      
      if (startDate || endDate) {
        matchConditions['orderStatus.payment_time'] = {};
        if (startDate) {
          // Start of the day (00:00:00)
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchConditions['orderStatus.payment_time']['$gte'] = start;
        }
        if (endDate) {
          // End of the day (23:59:59.999) - INCLUSIVE
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchConditions['orderStatus.payment_time']['$lte'] = end;
        }
      }

      // Build sort object
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const aggregationPipeline = [
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'orderStatus'
          }
        },
        {
          $unwind: {
            path: '$orderStatus',
            preserveNullAndEmptyArrays: true
          }
        },
        { $match: matchConditions },
        {
          $project: {
            collect_id: '$_id', // Assessment requirement
            school_id: 1, // Assessment requirement
            gateway: '$gateway_name', // Assessment requirement (mapped from gateway_name)
            order_amount: '$orderStatus.order_amount', // Assessment requirement
            transaction_amount: '$orderStatus.transaction_amount', // Assessment requirement
            status: '$orderStatus.status', // Assessment requirement
            custom_order_id: 1, // Assessment requirement
            // Additional useful fields for frontend
            student_info: 1,
            payment_mode: '$orderStatus.payment_mode',
            payment_time: '$orderStatus.payment_time',
            payment_message: '$orderStatus.payment_message',
            createdAt: 1
          }
        },
        { $sort: sortObj },
        { $skip: skip },
        { $limit: limit }
      ];

      const transactions = await this.orderModel.aggregate(aggregationPipeline);
      
      // Get total count for pagination
      const countPipeline = [
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'orderStatus'
          }
        },
        {
          $unwind: {
            path: '$orderStatus',
            preserveNullAndEmptyArrays: true
          }
        },
        { $match: matchConditions },
        { $count: 'total' }
      ];

      const totalResult = await this.orderModel.aggregate(countPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      return {
        success: true,
        school_id: schoolId,
        data: transactions,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          records_per_page: limit
        }
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch school transactions: ${error.message}`);
    }
  }

  /**
   * Get transaction status by ID
   * Retrieves transaction status for a specific transaction ID
   * 
   * @param id - ID of the transaction
   * @returns {Promise<object>} Transaction status response
   */
  async getTransactionStatus(id: string): Promise<any> {
    try {
      // Find order by MongoDB _id or custom_order_id
      let order;
      
      // Try to find by MongoDB ObjectId first
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await this.orderModel.findById(id);
      }
      
      // If not found or not valid ObjectId, try custom_order_id
      if (!order) {
        order = await this.orderModel.findOne({ custom_order_id: id });
      }

      if (!order) {
        return {
          success: false,
          message: 'Transaction not found',
          transaction_id: id
        };
      }

      // Get order status
      const orderStatus = await this.orderStatusModel.findOne({ collect_id: order._id });

      return {
        success: true,
        transaction: {
          id: order._id,
          custom_order_id: order.custom_order_id,
          school_id: order.school_id,
          trustee_id: order.trustee_id,
          student_info: order.student_info,
          gateway_name: order.gateway_name,
          created_at: order.createdAt,
          updated_at: order.updatedAt,
          order_amount: orderStatus?.order_amount || 0,
          transaction_amount: orderStatus?.transaction_amount || 0,
          payment_mode: orderStatus?.payment_mode || 'pending',
          payment_details: orderStatus?.payment_details || '',
          bank_reference: orderStatus?.bank_reference || '',
          payment_message: orderStatus?.payment_message || '',
          status: orderStatus?.status || 'pending',
          error_message: orderStatus?.error_message || '',
          payment_time: orderStatus?.payment_time || order.createdAt
        }
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get transaction status: ${error.message}`);
    }
  }
}