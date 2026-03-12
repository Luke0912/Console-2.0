import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    company: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[]; // S3 URLs
    purchaseUrl: string;
    sku?: string;
    category?: string;
    tags: string[];
    isFeatured: boolean;
    isActive: boolean;
    priority: number; // Higher = shows first in carousel
    stockStatus: 'in_stock' | 'out_of_stock' | 'pre_order';
    metadata: {
        impressions: number;
        clicks: number;
        conversions: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            default: 'USD',
            uppercase: true,
            length: 3,
        },
        images: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length > 0,
                message: 'At least one image is required',
            },
        },
        purchaseUrl: {
            type: String,
            required: true,
            trim: true,
        },
        sku: {
            type: String,
            trim: true,
            sparse: true,
        },
        category: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: Number,
            default: 0,
            index: true,
        },
        stockStatus: {
            type: String,
            enum: ['in_stock', 'out_of_stock', 'pre_order'],
            default: 'in_stock',
        },
        metadata: {
            impressions: {
                type: Number,
                default: 0,
            },
            clicks: {
                type: Number,
                default: 0,
            },
            conversions: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient product queries
productSchema.index({ company: 1, isActive: 1, priority: -1 });
productSchema.index({ company: 1, isFeatured: 1, isActive: 1 });

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
