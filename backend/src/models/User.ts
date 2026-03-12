import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    EDITOR = 'editor',
}

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    company: mongoose.Types.ObjectId;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Don't include password in queries by default
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.EDITOR,
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
userSchema.index({ email: 1, company: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
