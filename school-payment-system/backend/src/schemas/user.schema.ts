/**
 * School Payment System - User Schema
 * Written by: Arpit Singh
 * EDVIRON Software Developer Assessment
 * 
 * This schema defines the structure for user authentication in MongoDB.
 * It stores user credentials with bcrypt password hashing for security
 * and supports role-based access control for the payment system.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Type definition combining User class with MongoDB Document
export type UserDocument = User & Document;

/**
 * User Schema - MongoDB collection for authentication and user management
 * Stores user credentials, profile information, and role assignments
 * Used by JWT authentication system for secure API access
 */
@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt fields
export class User {
  /**
   * Unique username for user identification
   * Used for login and user identification across the system
   */
  @Prop({ required: true, unique: true })
  username: string;

  /**
   * Unique email address for the user
   * Used for communication and as an alternative login method
   */
  @Prop({ required: true, unique: true })
  email: string;

  /**
   * User password - stored as bcrypt hash for security
   * Plain text passwords are never stored in the database
   * Hashed using bcrypt with 12 salt rounds for strong security
   */
  @Prop({ required: true })
  password: string; // Will be hashed with bcrypt

  /**
   * User role for access control
   * Determines permissions and access levels within the payment system
   * Default role is 'admin' for this payment management system
   */
  @Prop({ required: true, default: 'admin' })
  role: string;
}

// Create MongoDB schema from the User class
export const UserSchema = SchemaFactory.createForClass(User);

// Create performance indexes for authentication queries
// These indexes speed up login and user lookup operations
UserSchema.index({ username: 1 }); // Index for username-based login
UserSchema.index({ email: 1 });    // Index for email-based operations
