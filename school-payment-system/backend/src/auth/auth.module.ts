/**
 * School Payment System - Authentication Module
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This module configures authentication-related functionality including JWT tokens,
 * Passport integration, user schema, and exports auth services for other modules.
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from '../schemas/user.schema';

// JWT secret key loaded from environment variables for security
// Falls back to default if not provided (only for development)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024';

/**
 * AuthModule - Authentication module configuration
 * Sets up JWT authentication, Passport integration, and user management
 */
@Module({
  imports: [
    // Import User schema for database operations within auth module
    // This allows auth services to interact with the User collection
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    
    // Configure Passport module for authentication strategies
    // Passport provides a framework for implementing authentication
    PassportModule,
    
    // Configure JWT module for token generation and validation
    // Uses environment variables for secret and expiration time
    JwtModule.register({
      secret: JWT_SECRET, // Secret key for signing JWT tokens
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }, // Token expiration time
    }),
  ],
  controllers: [AuthController], // Register auth controller for handling HTTP requests
  providers: [AuthService, JwtStrategy], // Register auth services and JWT strategy
  exports: [AuthService, JwtStrategy], // Export services for use in other modules
})
export class AuthModule {}