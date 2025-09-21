/**
 * School Payment System - JWT Authentication Strategy
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This strategy handles JWT token validation for protected routes using Passport.js.
 * It extracts JWT tokens from Authorization headers and validates them for API access.
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * JwtStrategy - Passport JWT authentication strategy implementation
 * Handles JWT token extraction, validation, and user context creation for protected routes
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Debug log to track strategy initialization
    console.log('JwtStrategy constructor called');
    
    // Configure JWT strategy with extraction and validation options
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Authorization header
      ignoreExpiration: false, // Validate token expiration
      secretOrKey: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024', // Secret key for verification
    });
    
    // Debug log to confirm strategy configuration
    console.log('JwtStrategy super() called with secret:', process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024');
  }

  /**
   * JWT token validation method
   * Called automatically by Passport when a JWT token is found in the request
   * Extracts user information from the token payload and creates user context
   * 
   * @param payload - Decoded JWT token payload containing user information
   * @returns {object} User object for request context or throws UnauthorizedException
   */
  async validate(payload: any) {
    // Debug logs to track validation process
    console.log('JWT Strategy - validate() method called!');
    console.log('JWT Strategy - Payload received:', payload);
    
    // Create user object from JWT payload
    // This user object will be available in controllers via @Req() decorator
    const user = { 
      userId: payload.sub,        // User ID from JWT 'sub' claim
      username: payload.username, // Username from JWT payload
      role: payload.role          // User role for authorization
    };
    
    // Debug log to confirm user object creation
    console.log('JWT Strategy - User object created:', user);
    
    // Return user object to be attached to request
    // This makes user information available in protected route handlers
    return user;
  }
}