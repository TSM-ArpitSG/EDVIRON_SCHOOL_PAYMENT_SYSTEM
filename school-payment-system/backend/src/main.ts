/**
 * School Payment System - Main Application Entry Point
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This file bootstraps the NestJS application with all necessary configurations
 * including global validation, error handling, CORS policies, and security settings.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/http-exception.filter';

/**
 * Bootstrap function - Entry point of the application
 * Sets up the NestJS application with all required middleware and configurations
 */
async function bootstrap() {
  // Create NestJS application instance with AppModule as root module
  const app = await NestFactory.create(AppModule);

  // Configure global exception filter for consistent error responses across all endpoints
  // This ensures all errors follow the same format and are properly logged
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configure global validation pipe for request data validation and sanitization
  // This provides security against injection attacks and ensures data integrity
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,                    // Remove properties that don't have decorators
    forbidNonWhitelisted: true,         // Throw error if non-whitelisted properties are present
    transform: true,                    // Automatically transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true,   // Enable automatic type conversion (string to number, etc.)
    },
  }));

  // Configure CORS (Cross-Origin Resource Sharing) for security
  // Different settings for development and production environments
  app.enableCors({
    // Allow requests from different origins based on environment
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Production: Only allow secure HTTPS origins
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'], // Development: Allow local origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
    credentials: true, // Allow cookies and authorization headers
  });

  // Get port from environment variables or default to 3000
  const port = process.env.PORT ?? 3000;
  
  // Start the HTTP server on the specified port
  await app.listen(port);
  
  // Display startup information for development
  console.log(` School Payment System API is running on: http://localhost:${port}`);
  console.log(` API Documentation: http://localhost:${port}/docs`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
}

// Start the application
bootstrap();
