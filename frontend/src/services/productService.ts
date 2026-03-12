import api from '@/lib/api';

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    purchaseUrl: string;
    sku?: string;
    category?: string;
    tags: string[];
    isFeatured: boolean;
    isActive: boolean;
    priority: number;
    stockStatus: 'in_stock' | 'out_of_stock' | 'pre_order';
    metadata: {
        impressions: number;
        clicks: number;
        conversions: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
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

export const productService = {
    async getProducts(params?: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        isFeatured?: boolean;
        category?: string;
        search?: string;
    }) {
        const response = await api.get('/products', { params });
        return response.data.data;
    },

    async getProduct(id: string) {
        const response = await api.get(`/products/${id}`);
        return response.data.data;
    },

    async createProduct(data: CreateProductData) {
        const response = await api.post('/products', data);
        return response.data.data;
    },

    async updateProduct(id: string, data: Partial<CreateProductData>) {
        const response = await api.put(`/products/${id}`, data);
        return response.data.data;
    },

    async deleteProduct(id: string) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
