import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type Product } from '@/services/productService';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Package, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ProductForm from '@/components/ProductForm';

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['products', page, searchQuery],
        queryFn: () => productService.getProducts({ page, search: searchQuery }),
    });

    const deleteMutation = useMutation({
        mutationFn: productService.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete product');
        },
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
    };

    const products = data?.products || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary-400" />
                        Products
                    </h1>
                    <p className="text-gray-400">
                        Manage your product catalog for Instagram DM carousels
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Search */}
            <div className="dashboard-card">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                    />
                </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="spinner mx-auto mb-4" />
                        <p className="text-gray-400">Loading products...</p>
                    </div>
                </div>
            ) : products.length === 0 ? (
                <div className="dashboard-card text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Products Yet</h3>
                    <p className="text-gray-400 mb-6">
                        Add your first product to start sending carousels in Instagram DMs
                    </p>
                    <button
                        onClick={handleCreate}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: Product) => (
                        <div key={product._id} className="glass-card-hover overflow-hidden">
                            {/* Product Image */}
                            <div className="relative h-48 bg-dark-700">
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                {product.isFeatured && (
                                    <div className="absolute top-3 right-3 badge badge-warning flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        Featured
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className={`badge ${product.stockStatus === 'in_stock'
                                            ? 'badge-success'
                                            : product.stockStatus === 'out_of_stock'
                                                ? 'badge-error'
                                                : 'badge-info'
                                            }`}
                                    >
                                        {product.stockStatus.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-2 truncate">
                                    {product.name}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-2xl font-bold text-primary-400">
                                        {formatCurrency(product.price, product.currency)}
                                    </p>
                                    {product.category && (
                                        <span className="badge bg-white/10 text-gray-300">
                                            {product.category}
                                        </span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/5 rounded-xl">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">Views</p>
                                        <p className="font-semibold text-white">
                                            {product.metadata.impressions}
                                        </p>
                                    </div>
                                    <div className="text-center border-x border-white/10">
                                        <p className="text-xs text-gray-400 mb-1">Clicks</p>
                                        <p className="font-semibold text-white">
                                            {product.metadata.clicks}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">Conv.</p>
                                        <p className="font-semibold text-white">
                                            {product.metadata.conversions}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="btn-ghost flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id, product.name)}
                                        className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data && data.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-gray-400">
                        Page {page} of {data.pages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === data.pages}
                        className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Product Form Modal */}
            {showModal && (
                <ProductForm
                    product={selectedProduct}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
