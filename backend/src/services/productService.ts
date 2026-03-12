import Product, { IProduct } from '../models/Product';
import Company from '../models/Company';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

interface CreateProductData {
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    purchaseUrl: string;
    sku?: string;
    category?: string;
    tags?: string[];
    isFeatured?: boolean;
    priority?: number;
    stockStatus?: 'in_stock' | 'out_of_stock' | 'pre_order';
}

interface UpdateProductData extends Partial<CreateProductData> {
    isActive?: boolean;
}

interface ProductQuery {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    category?: string;
    search?: string;
}

/**
 * Create a new product
 */
export const createProduct = async (
    companyId: string,
    data: CreateProductData
): Promise<IProduct> => {
    // Check company product limit
    const company = await Company.findById(companyId);

    if (!company) {
        throw new NotFoundError('Company not found');
    }

    const productCount = await Product.countDocuments({ company: companyId });

    if (productCount >= company.maxProducts) {
        throw new ForbiddenError(
            `Product limit reached. Your plan allows ${company.maxProducts} products.`
        );
    }

    // Validate images
    if (!data.images || data.images.length === 0) {
        throw new ValidationError('At least one product image is required');
    }

    // Create product
    const product = await Product.create({
        company: companyId,
        ...data,
    });

    logger.info(`Created product ${product._id} for company ${companyId}`);

    return product;
};

/**
 * Get products for a company with pagination
 */
export const getProducts = async (
    companyId: string,
    query: ProductQuery
): Promise<{ products: IProduct[]; total: number; page: number; pages: number }> => {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { company: companyId };

    if (query.isActive !== undefined) {
        filter.isActive = query.isActive;
    }

    if (query.isFeatured !== undefined) {
        filter.isFeatured = query.isFeatured;
    }

    if (query.category) {
        filter.category = query.category;
    }

    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } },
            { tags: { $in: [new RegExp(query.search, 'i')] } },
        ];
    }

    // Execute query
    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(filter),
    ]);

    return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

/**
 * Get a single product by ID
 */
export const getProductById = async (
    productId: string,
    companyId: string
): Promise<IProduct> => {
    const product = await Product.findOne({
        _id: productId,
        company: companyId,
    });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    return product;
};

/**
 * Update a product
 */
export const updateProduct = async (
    productId: string,
    companyId: string,
    data: UpdateProductData
): Promise<IProduct> => {
    const product = await Product.findOne({
        _id: productId,
        company: companyId,
    });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    // Update fields
    Object.assign(product, data);
    await product.save();

    logger.info(`Updated product ${productId}`);

    return product;
};

/**
 * Delete a product
 */
export const deleteProduct = async (
    productId: string,
    companyId: string
): Promise<void> => {
    const product = await Product.findOne({
        _id: productId,
        company: companyId,
    });

    if (!product) {
        throw new NotFoundError('Product not found');
    }

    await product.deleteOne();

    logger.info(`Deleted product ${productId}`);
};

/**
 * Get products for carousel based on company settings
 */
export const getProductsForCarousel = async (
    companyId: string,
    maxProducts: number = 5
): Promise<IProduct[]> => {
    const company = await Company.findById(companyId);

    if (!company) {
        throw new NotFoundError('Company not found');
    }

    const strategy = company.settings.carouselProductSelectionStrategy;
    const limit = Math.min(maxProducts, company.settings.maxProductsInCarousel);

    let products: IProduct[] = [];

    switch (strategy) {
        case 'featured':
            // Get featured products first, then by priority
            products = await Product.find({
                company: companyId,
                isActive: true,
                isFeatured: true,
                stockStatus: { $ne: 'out_of_stock' },
            })
                .sort({ priority: -1, createdAt: -1 })
                .limit(limit);

            // If not enough featured products, fill with regular products
            if (products.length < limit) {
                const remaining = limit - products.length;
                const additionalProducts = await Product.find({
                    company: companyId,
                    isActive: true,
                    isFeatured: false,
                    stockStatus: { $ne: 'out_of_stock' },
                    _id: { $nin: products.map((p) => p._id) },
                })
                    .sort({ priority: -1, createdAt: -1 })
                    .limit(remaining);

                products = [...products, ...additionalProducts];
            }
            break;

        case 'newest':
            products = await Product.find({
                company: companyId,
                isActive: true,
                stockStatus: { $ne: 'out_of_stock' },
            })
                .sort({ createdAt: -1 })
                .limit(limit);
            break;

        case 'top_sellers':
            // Sort by conversions
            products = await Product.find({
                company: companyId,
                isActive: true,
                stockStatus: { $ne: 'out_of_stock' },
            })
                .sort({ 'metadata.conversions': -1, 'metadata.clicks': -1 })
                .limit(limit);
            break;

        case 'random':
            const allProducts = await Product.find({
                company: companyId,
                isActive: true,
                stockStatus: { $ne: 'out_of_stock' },
            });

            // Shuffle and take first N
            const shuffled = allProducts.sort(() => 0.5 - Math.random());
            products = shuffled.slice(0, limit);
            break;

        default:
            products = await Product.find({
                company: companyId,
                isActive: true,
                stockStatus: { $ne: 'out_of_stock' },
            })
                .sort({ priority: -1 })
                .limit(limit);
    }

    return products;
};

/**
 * Increment product impressions
 */
export const incrementProductImpressions = async (
    productIds: string[]
): Promise<void> => {
    await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { 'metadata.impressions': 1 } }
    );
};

/**
 * Increment product clicks
 */
export const incrementProductClicks = async (productId: string): Promise<void> => {
    await Product.updateOne(
        { _id: productId },
        { $inc: { 'metadata.clicks': 1 } }
    );
};

/**
 * Increment product conversions
 */
export const incrementProductConversions = async (
    productId: string
): Promise<void> => {
    await Product.updateOne(
        { _id: productId },
        { $inc: { 'metadata.conversions': 1 } }
    );
};
