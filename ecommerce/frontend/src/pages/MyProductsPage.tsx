import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../services/productService';
import Pagination from '../components/Pagination';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import toast, { Toaster } from 'react-hot-toast';

interface SortableHeaderProps {
    field: string;
    label: string;
    currentSort: string;
    currentOrder: string;
    onSort: (field: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ field, label, currentSort, currentOrder, onSort }) => (
    <th
        className="text-left p-4 text-gray-200 cursor-pointer hover:bg-white/5 transition select-none"
        onClick={() => onSort(field)}
    >
        <div className="flex items-center gap-1">
            {label}
            {currentSort === field && (
                <span className="text-purple-400">{currentOrder === 'asc' ? '↑' : '↓'}</span>
            )}
        </div>
    </th>
);

const MyProductsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
    const [deleting, setDeleting] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

    const filter = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const page = Number(searchParams.get('page')) || 1;
            const limit = Number(searchParams.get('limit')) || 20;
            const params: any = { page, limit, sortBy, sortOrder };
            if (filter !== 'all') params.status = filter;
            const response = await productService.getMyProducts(params);
            setProducts(response.data.products);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        setSearchParams((params) => {
            const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
            params.set('sortBy', field);
            params.set('sortOrder', newOrder);
            return params;
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.product) return;
        setDeleting(true);
        try {
            await productService.deleteProduct(deleteModal.product._id);
            setProducts(products.filter((p) => p._id !== deleteModal.product!._id));
            toast.success('Product deleted');
            setDeleteModal({ open: false, product: null });
        } catch (error) {
            toast.error('Failed to delete product');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <Toaster position="top-right" />
            <DeleteConfirmModal
                isOpen={deleteModal.open}
                title="Delete Product"
                itemName={deleteModal.product?.title || ''}
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ open: false, product: null })}
                loading={deleting}
            />

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">My Products</h1>
                    <Link to="/products/create" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                        + Create Product
                    </Link>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'draft', 'active', 'archived'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setSearchParams((p) => { p.set('status', status); p.set('page', '1'); return p; })}
                            className={`px-4 py-2 rounded-lg transition ${filter === status ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Products Table */}
                {loading ? (
                    <div className="bg-white/10 rounded-xl p-8 text-center"><div className="text-white">Loading...</div></div>
                ) : products.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                        <p className="text-gray-400 mb-4">No products found</p>
                        <Link to="/products/create" className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                            Create Your First Product
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <SortableHeader field="title" label="Product" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                    <th className="text-left p-4 text-gray-200">Category</th>
                                    <SortableHeader field="price" label="Price" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                    <th className="text-left p-4 text-gray-200">Stock</th>
                                    <SortableHeader field="status" label="Status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                    <SortableHeader field="createdAt" label="Created" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                    <th className="text-right p-4 text-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center text-white font-bold">
                                                    {product.title[0]}
                                                </div>
                                                <span className="text-white font-medium">{product.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{product.category}</td>
                                        <td className="p-4 text-white">${product.price}</td>
                                        <td className="p-4 text-gray-300">{product.stock}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active' ? 'bg-green-600' : product.status === 'draft' ? 'bg-yellow-600' : 'bg-gray-600'} text-white`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">{new Date(product.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <Link to={`/products/${product._id}`} className="text-blue-400 hover:underline">View</Link>
                                            <Link to={`/products/${product._id}/edit`} className="text-purple-400 hover:underline">Edit</Link>
                                            <button onClick={() => setDeleteModal({ open: true, product })} className="text-red-400 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
                    onLimitChange={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
                />
            </div>
        </div>
    );
};

export default MyProductsPage;
