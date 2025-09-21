/**
 * School Payment System - Authentication Controller
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This controller handles user authentication endpoints including user registration
 * and login functionality with JWT token generation for secure API access.
 */

import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

/**
 * RegisterDto - Data Transfer Object for user registration
 * Defines the structure and validation rules for user registration requests
 */
class RegisterDto {
  /**
   * Username - Unique identifier for the user
   * Validation rules: required, string, minimum length 3 characters
   */
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  /**
   * Email - User's email address
   * Validation rules: required, valid email format
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * Password - User's password
   * Validation rules: required, string, minimum length 6 characters
   */
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

/**
 * LoginDto - Data Transfer Object for user login
 * Defines the structure and validation rules for user login requests
 */
class LoginDto {
  /**
   * Username - Unique identifier for the user
   * Validation rules: required, string
   */
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  username: string;

  /**
   * Password - User's password
   * Validation rules: required, string
   */
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

/**
 * AuthController - Handles authentication-related HTTP requests
 * Provides endpoints for user registration and login with JWT token generation
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructor - Initializes the AuthController instance
   * @param authService - Instance of the AuthService class
   */
  constructor(private authService: AuthService) {}

  /**
   * User registration endpoint - POST /auth/register
   * Creates a new user account with hashed password storage
   * 
   * @param registerDto - User registration data (username, email, password)
   * @returns {Promise<object>} Success response with user details or error message
   */
  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    return this.authService.register(username, email, password);
  }

  /**
   * User login endpoint - POST /auth/login
   * Authenticates the user and generates a JWT token for secure API access
   * 
   * @param loginDto - User login data (username, password)
   * @returns {Promise<object>} Success response with JWT token or error message
   */
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    const { username, password } = loginDto;
    return this.authService.login(username, password);
  }
}