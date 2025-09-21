/**
 * School Payment System - Global Exception Filter
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This filter provides centralized error handling across the entire application.
 * It ensures consistent error response format, proper logging, and security by
 * preventing sensitive information leakage in error responses.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * GlobalExceptionFilter - Centralized error handling for all HTTP requests
 * Catches all exceptions and formats them into consistent error responses
 * Provides comprehensive logging for monitoring and debugging purposes
 */
@Catch() // Catches all exceptions (not just HttpExceptions)
export class GlobalExceptionFilter implements ExceptionFilter {
  // Logger instance for recording error information
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Main exception handling method
   * Processes all exceptions and creates standardized error responses
   * 
   * @param exception - The caught exception (any type)
   * @param host - ArgumentsHost containing request/response context
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    // Get HTTP context from the ArgumentsHost
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Initialize error response variables
    let status: number;
    let message: string | object;
    let error: string;

    // Check if this is a known HttpException (validation errors, etc.)
    if (exception instanceof HttpException) {
      // Extract status code from HttpException
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Handle different response formats from HttpException
      if (typeof exceptionResponse === 'object') {
        // Extract message and error from object response
        message = (exceptionResponse as any).message || exceptionResponse;
        error = (exceptionResponse as any).error || 'Bad Request';
      } else {
        // Handle string response
        message = exceptionResponse;
        error = 'Bad Request';
      }
    } else {
      // Handle unexpected errors (database errors, network issues, etc.)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error'; // Generic message for security
      error = 'Internal Server Error';
      
      // Log unexpected errors with full details for debugging
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
        `${request.method} ${request.url}`,
      );
    }

    // Log all errors for monitoring and audit purposes
    this.logger.error(
      `HTTP ${status} Error: ${JSON.stringify(message)}`,
      `${request.method} ${request.url}`,
    );

    // Create standardized error response object
    const errorResponse = {
      success: false,                           // Consistent success flag
      statusCode: status,                       // HTTP status code
      error,                                    // Error category
      message,                                  // Detailed error message
      timestamp: new Date().toISOString(),      // Error timestamp
      path: request.url,                        // Request path for debugging
      method: request.method,                   // HTTP method for debugging
    };

    // Send error response to client
    response.status(status).json(errorResponse);
  }
}
