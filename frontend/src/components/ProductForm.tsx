import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { X, Upload, Trash2, Sparkles, DollarSign, Package, Tag, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';

const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    currency: z.string().min(3, 'Currency is required'),
    purchaseUrl: z.string().url('Must be a valid URL'),
    category: z.string().optional(),
    tags: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    priority: z.number().min(0).max(100).optional(),
    stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    product?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>(product?.images || []);
    const [uploadingImage, setUploadingImage] = useState(false);
    const isEditMode = !!product;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product
            ? {
                name: product.name,
                description: product.description,
                price: product.price,
                currency: product.currency,
                purchaseUrl: product.purchaseUrl,
                category: product.category || '',
                tags: product.tags?.join(', ') || '',
                isFeatured: product.isFeatured || false,
                isActive: product.isActive !== false,
                priority: product.priority || 0,
                stockStatus: product.stockStatus || 'in_stock',
            }
            : {
                currency: 'USD',
                isFeatured: false,
                isActive: true,
                priority: 0,
                stockStatus: 'in_stock',
            },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('images', file);
            });

            const response = await api.post('/upload/images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrls = response.data.data.map((img: any) => img.url);
            setImages([...images, ...uploadedUrls]);
            toast.success(`${uploadedUrls.length} image(s) uploaded!`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Image upload failed');
            console.error('Upload error:', error);
        } finally {
            setUploadingImage(false);
            e.target.value = ''; // Reset input
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        toast.success('Image removed');
    };

    const onSubmit = async (data: ProductFormData) => {
        if (images.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        setIsLoading(true);
        try {
            const productData = {
                ...data,
                images,
                tags: data.tags
                    ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
                    : [],
            };

            if (isEditMode) {
                await api.put(`/products/${product._id}`, productData);
                toast.success('Product updated successfully!');
            } else {
                await api.post('/products', productData);
                toast.success('Product created successfully!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`;
            toast.error(errorMessage);
            console.error('Submit error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-dark-800/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary-400" />
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Product Images */}
                    <div>
                        <label className="input-label flex items-center gap-2 mb-3">
                            <ImageIcon className="w-4 h-4" />
                            Product Images
                        </label>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {images.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-xl border-2 border-white/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="group cursor-pointer">
                                <div className="h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-500/5 transition-all">
                                    {uploadingImage ? (
                                        <>
                                            <div className="spinner" />
                                            <p className="text-xs text-gray-400">Uploading...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-400" />
                                            <p className="text-xs text-gray-400 group-hover:text-primary-400">
                                                Upload Image
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400">
                            Upload up to 10 images. JPEG, PNG, GIF, or WebP. Max 5MB each.
                        </p>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label htmlFor="name" className="input-label flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Product Name
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            id="name"
                            className="input-field"
                            placeholder="Premium Wireless Headphones"
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="input-label">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            id="description"
                            rows={4}
                            className="input-field resize-none"
                            placeholder="Describe your product in detail..."
                            disabled={isLoading}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Price & Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="price" className="input-label flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Price
                            </label>
                            <input
                                {...register('price', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                id="price"
                                className="input-field"
                                placeholder="299.99"
                                disabled={isLoading}
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="currency" className="input-label">
                                Currency
                            </label>
                            <select {...register('currency')} id="currency" className="input-field" disabled={isLoading}>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="AUD">AUD (A$)</option>
                                <option value="CAD">CAD (C$)</option>
                            </select>
                            {errors.currency && (
                                <p className="mt-1 text-sm text-red-400">{errors.currency.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Purchase URL */}
                    <div>
                        <label htmlFor="purchaseUrl" className="input-label flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Purchase URL
                        </label>
                        <input
                            {...register('purchaseUrl')}
                            type="url"
                            id="purchaseUrl"
                            className="input-field"
                            placeholder="https://example.com/product/123"
                            disabled={isLoading}
                        />
                        {errors.purchaseUrl && (
                            <p className="mt-1 text-sm text-red-400">{errors.purchaseUrl.message}</p>
                        )}
                    </div>

                    {/* Category & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="input-label flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Category
                            </label>
                            <input
                                {...register('category')}
                                type="text"
                                id="category"
                                className="input-field"
                                placeholder="Electronics"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="tags" className="input-label">
                                Tags (comma-separated)
                            </label>
                            <input
                                {...register('tags')}
                                type="text"
                                id="tags"
                                className="input-field"
                                placeholder="wireless, audio, premium"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Stock Status & Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="stockStatus" className="input-label">
                                Stock Status
                            </label>
                            <select {...register('stockStatus')} id="stockStatus" className="input-field" disabled={isLoading}>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="priority" className="input-label">
                                Display Priority (0-100)
                            </label>
                            <input
                                {...register('priority', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                max="100"
                                id="priority"
                                className="input-field"
                                placeholder="0"
                                disabled={isLoading}
                            />
                            <p className="mt-1 text-xs text-gray-400">Higher priority products appear first</p>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                {...register('isFeatured')}
                                type="checkbox"
                                id="isFeatured"
                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="isFeatured" className="text-sm text-gray-300">
                                Mark as featured product
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                {...register('isActive')}
                                type="checkbox"
                                id="isActive"
                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-300">
                                Product is active (visible in catalog)
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                            disabled={isLoading || uploadingImage}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {isEditMode ? 'Update Product' : 'Create Product'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
