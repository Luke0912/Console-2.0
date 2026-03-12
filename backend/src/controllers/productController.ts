import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';
import { z } from 'zod';

const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be positive'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    images: z.array(z.string().url()).min(1, 'At least one image is required'),
    purchaseUrl: z.string().url('Invalid purchase URL'),
    sku: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    priority: z.number().optional(),
    stockStatus: z.enum(['in_stock', 'out_of_stock', 'pre_order']).optional(),
});

/**
 * Create a new product
 */
export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const validatedData = createProductSchema.parse(req.body);

        const product = await productService.createProduct(
            req.companyId,
            validatedData
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all products
 */
export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const query = {
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
            isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
            isFeatured: req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined,
            category: req.query.category as string,
            search: req.query.search as string,
        };

        const result = await productService.getProducts(req.companyId, query);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single product
 */
export const getProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const product = await productService.getProductById(
            req.params.id,
            req.companyId
        );

        res.json({
            success: true,
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update product
 */
export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const product = await productService.updateProduct(
            req.params.id,
            req.companyId,
            req.body
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete product
 */
export const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        await productService.deleteProduct(req.params.id, req.companyId);

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
