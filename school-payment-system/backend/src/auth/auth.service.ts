/**
 * School Payment System - Authentication Service
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This service handles user authentication logic including user registration,
 * login functionality, password hashing, and JWT token generation for secure API access.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';

/**
 * AuthService - Core authentication business logic
 * Handles user registration, login, password management, and JWT token operations
 */
@Injectable()
export class AuthService {
  constructor(
    // Inject User model for database operations
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // Inject JWT service for token generation and validation
    private jwtService: JwtService,
  ) {}

  /**
   * User registration method
   * Creates a new user account with encrypted password and generates JWT token
   * 
   * @param username - Unique username for the user
   * @param email - User's email address
   * @param password - Plain text password (will be hashed)
   * @returns {Promise<object>} JWT token and user details or throws exception
   */
  async register(username: string, email: string, password: string): Promise<any> {
    // Check if user already exists by email or username
    // This prevents duplicate accounts and maintains data integrity
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password using bcrypt with salt rounds of 12
    // Higher salt rounds provide better security against brute force attacks
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user document with hashed password
    // Default role is set to 'admin' for this payment system
    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    // Save the new user to MongoDB
    await user.save();

    // Generate JWT token with user information
    // Token contains username, user ID, and role for authorization
    const payload = { username: user.username, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * User login method
   * Authenticates user credentials and generates JWT token for API access
   * 
   * @param username - User's username
   * @param password - User's plain text password
   * @returns {Promise<object>} JWT token and user details or throws exception
   */
  async login(username: string, password: string): Promise<any> {
    // Find user by username in the database
    const user = await this.userModel.findOne({ username });
    if (!user) {
      // Return generic error message to prevent username enumeration attacks
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password by comparing with stored hash
    // bcrypt.compare safely handles the hash comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Return same generic error message for security
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token for authenticated user
    // Token will be used for subsequent API requests
    const payload = { username: user.username, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * User validation method for JWT strategy
   * Retrieves user information by ID for JWT token validation
   * 
   * @param userId - User's unique identifier from JWT token
   * @returns {Promise<object>} User details without password or null if not found
   */
  async validateUser(userId: string): Promise<any> {
    // Find user by ID and exclude password field for security
    // Used by JWT strategy to validate tokens and get user context
    return this.userModel.findById(userId).select('-password');
  }
}