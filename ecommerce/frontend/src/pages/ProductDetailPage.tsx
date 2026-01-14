import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../services/productService';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchSimilarProducts();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await productService.getProduct(id!);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSimilarProducts = async () => {
        try {
            const response = await productService.getSimilarProducts(id!);
            setSimilarProducts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch similar products:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productService.deleteProduct(id!);
            navigate('/products/my-products');
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl animate-pulse">Loading Premium Experience...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Product not found</div>
            </div>
        );
    }

    const isOwner = user?.id === product.userId;

    const handleAddToCart = async () => {
        setLoading(true);
        try {
            await cartService.addToCart(product._id, 1);
            toast.success(`ACQUIRED: ${product.title}`, {
                icon: '⚡',
                style: {
                    background: '#0a0a0f',
                    color: '#00fff2',
                    border: '1px solid #00fff2',
                },
            });
        } catch (error) {
            toast.error('TRANSFER FAILED', {
                style: {
                    background: '#0a0a0f',
                    color: '#ff4444',
                    border: '1px solid #ff4444',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="text-purple-400 hover:text-purple-300 mb-8 flex items-center gap-2 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Products
                </button>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 lg:p-10 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-700">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-8xl font-bold text-slate-700">{product.title[0]}</span>
                                )}
                            </div>
                            {product.images?.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.slice(1, 5).map((img, i) => (
                                        <div key={i} className="aspect-square rounded-lg border border-slate-700 overflow-hidden cursor-pointer hover:border-purple-500 transition">
                                            <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80 transition" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full mb-3">
                                        {product.category}
                                    </span>
                                    <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <span>SKU: {product.sku || 'N/A'}</span>
                                        <span>•</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                                {isOwner && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/products/${product._id}/edit`)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                            title="Edit Product"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                            title="Delete Product"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-bold text-white">${product.price}</span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <>
                                            <span className="text-xl text-slate-500 line-through">${product.compareAtPrice}</span>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                                Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                {product.description && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                                        <p className="text-slate-300 leading-relaxed">{product.description}</p>
                                    </div>
                                )}

                                {product.tags && product.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag) => (
                                                <span key={tag} className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isOwner && (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={loading || product.stock <= 0}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Adding...
                                        </>
                                    ) : product.stock > 0 ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Add to Cart
                                        </>
                                    ) : (
                                        'Out of Stock'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white">Similar Products</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent mx-8" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarProducts.map((p) => (
                                <div
                                    key={p._id}
                                    onClick={() => {
                                        navigate(`/products/${p._id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden cursor-pointer group hover:border-purple-500/50 transition-all"
                                >
                                    <div className="aspect-square bg-slate-900 relative overflow-hidden">
                                        {p.images?.[0] ? (
                                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-700">
                                                {p.title[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="text-white font-medium truncate mb-1">{p.title}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-purple-400 font-bold">${p.price}</span>
                                            <span className="text-xs text-slate-500">{p.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
