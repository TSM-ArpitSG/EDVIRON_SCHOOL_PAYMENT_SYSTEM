/**
 * School Payment System - Orders Controller
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This controller handles all payment-related HTTP requests including payment creation,
 * webhook processing, transaction queries, and status checks with proper validation and security.
 */

import { Controller, Get, Post, Body, ValidationPipe, Query, Param, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min, IsUrl, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * StudentInfoDto - Data Transfer Object for student information
 * Validates student details required for payment processing
 */
class StudentInfoDto {
  /**
   * Student name
   * @example "John Doe"
   */
  @IsNotEmpty({ message: 'Student name is required' })
  @IsString({ message: 'Student name must be a string' })
  name: string;

  /**
   * Student ID
   * @example "S12345"
   */
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsString({ message: 'Student ID must be a string' })
  id: string;

  /**
   * Student email address
   * @example "john.doe@example.com"
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Student email is required' })
  email: string;
}

/**
 * CreatePaymentDto - Data Transfer Object for payment creation requests
 * Validates all required fields for creating a new payment order
 */
class CreatePaymentDto {
  /**
   * Payment amount in INR
   * @example 100
   */
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(1, { message: 'Amount must be at least 1 INR' })
  amount: number;

  /**
   * Student information
   * @type {StudentInfoDto}
   */
  @ValidateNested({ message: 'Student information is required' })
  @Type(() => StudentInfoDto)
  student_info: StudentInfoDto;

  /**
   * Callback URL for payment gateway
   * @example "https://example.com/callback"
   */
  @IsOptional()
  @IsUrl({}, { message: 'Callback URL must be a valid URL' })
  callback_url?: string;

  /**
   * Trustee ID (optional)
   * @example "T12345"
   */
  @IsOptional()
  @IsString({ message: 'Trustee ID must be a string' })
  trustee_id?: string;
}

/**
 * OrderInfoDto - Data Transfer Object for webhook order information
 * Validates order details received from payment gateway webhooks
 */
class OrderInfoDto {
  /**
   * Order ID
   * @example "ORD12345"
   */
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsString({ message: 'Order ID must be a string' })
  order_id: string;

  /**
   * Order amount
   * @example 100
   */
  @IsNumber({}, { message: 'Order amount must be a valid number' })
  @Min(0, { message: 'Order amount must be non-negative' })
  order_amount: number;

  /**
   * Transaction amount
   * @example 100
   */
  @IsNumber({}, { message: 'Transaction amount must be a valid number' })
  @Min(0, { message: 'Transaction amount must be non-negative' })
  transaction_amount: number;

  /**
   * Payment gateway
   * @example "PayU"
   */
  @IsNotEmpty({ message: 'Gateway is required' })
  @IsString({ message: 'Gateway must be a string' })
  gateway: string;

  /**
   * Bank reference number
   * @example "BNK12345"
   */
  @IsNotEmpty({ message: 'Bank reference is required' })
  @IsString({ message: 'Bank reference must be a string' })
  bank_reference: string;

  /**
   * Payment status
   * @example "success"
   */
  @IsNotEmpty({ message: 'Status is required' })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['success', 'failed', 'pending'], { message: 'Status must be success, failed, or pending' })
  status: string;

  /**
   * Payment mode
   * @example "credit_card"
   */
  @IsNotEmpty({ message: 'Payment mode is required' })
  @IsString({ message: 'Payment mode must be a string' })
  payment_mode: string;

  /**
   * Payment details
   * @example "Payment successful"
   */
  @IsNotEmpty({ message: 'Payment details are required' })
  @IsString({ message: 'Payment details must be a string' })
  payment_details: string;

  /**
   * Payment message
   * @example "Payment successful"
   */
  @IsNotEmpty({ message: 'Payment message is required' })
  @IsString({ message: 'Payment message must be a string' })
  payment_message: string;

  /**
   * Payment timestamp
   * @example "2022-01-01 12:00:00"
   */
  @IsNotEmpty({ message: 'Payment time is required' })
  @IsString({ message: 'Payment time must be a string' })
  payment_time: string;

  /**
   * Error message (optional)
   * @example "Payment failed"
   */
  @IsOptional()
  @IsString({ message: 'Error message must be a string' })
  error_message?: string;
}

/**
 * WebhookDto - Data Transfer Object for webhook requests
 * Validates webhook data received from payment gateway
 */
class WebhookDto {
  /**
   * Webhook status code
   * @example 200
   */
  @IsNumber({}, { message: 'Status must be a valid number' })
  status: number;

  /**
   * Order information
   * @type {OrderInfoDto}
   */
  @ValidateNested({ message: 'Order information is required' })
  @Type(() => OrderInfoDto)
  order_info: OrderInfoDto;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Test endpoint to verify controller is working
   * @returns {Promise<string>}
   */
  @Get('test')
  async getTest(): Promise<string> {
    return this.ordersService.getTestMessage();
  }

  /**
   * JWT test endpoint
   * @returns {Promise<string>}
   */
  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  async getTestAuth(): Promise<string> {
    return 'JWT authentication working!';
  }

  /**
   * Create payment endpoint - Now with JWT protection
   * @param {CreatePaymentDto} createPaymentDto
   * @returns {Promise<any>}
   */
  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(@Body(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true 
  })) createPaymentDto: CreatePaymentDto) {
    return this.ordersService.createPayment(createPaymentDto);
  }

  /**
   * Webhook endpoint - Public (external payment gateway calls this)
   * @param {WebhookDto} webhookDto
   * @returns {Promise<any>}
   */
  @Post('webhook')
  async handleWebhook(@Body(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true 
  })) webhookDto: WebhookDto) {
    return this.ordersService.handleWebhook(webhookDto);
  }

  /**
   * Get all transactions with pagination and filters
   * @param {string} page
   * @param {string} limit
   * @param {string} status
   * @param {string} paymentMode
   * @param {string} startDate
   * @param {string} endDate
   * @param {string} sortBy
   * @param {string} sortOrder
   * @returns {Promise<any>}
   */
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getAllTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('payment_mode') paymentMode?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('sort_by') sortBy: string = 'createdAt',
    @Query('sort_order') sortOrder: string = 'desc'
  ) {
    return this.ordersService.getAllTransactions({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      paymentMode,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });
  }

  /**
   * Get transactions for specific school
   * @param {string} schoolId
   * @param {string} page
   * @param {string} limit
   * @param {string} status
   * @param {string} paymentMode
   * @param {string} startDate
   * @param {string} endDate
   * @param {string} sortBy
   * @param {string} sortOrder
   * @returns {Promise<any>}
   */
  @Get('transactions/school/:schoolId')
  @UseGuards(JwtAuthGuard)
  async getSchoolTransactions(
    @Param('schoolId') schoolId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('payment_mode') paymentMode?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('sort_by') sortBy: string = 'createdAt',
    @Query('sort_order') sortOrder: string = 'desc'
  ) {
    return this.ordersService.getSchoolTransactions(schoolId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      paymentMode,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });
  }

  /**
   * Get transaction status by ID (order ID or custom order ID)
   * @param {string} id
   * @returns {Promise<any>}
   */
  @Get('transaction-status/:id')
  @UseGuards(JwtAuthGuard)
  async getTransactionStatus(@Param('id') id: string) {
    return this.ordersService.getTransactionStatus(id);
  }
}