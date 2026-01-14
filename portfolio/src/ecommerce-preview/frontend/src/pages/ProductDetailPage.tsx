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
        <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 font-sans relative overflow-hidden">
            <div className="absolute inset-0 aurora-bg opacity-30 fixed" />

            <div className="max-w-6xl mx-auto relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-cyan-400 hover:text-cyan-300 mb-8 flex items-center transition-all hover:-translate-x-1 cyber-underline"
                >
                    <span className="mr-2">←</span> BACK TO NETWORK
                </button>

                <div className="cyber-card p-8 mb-12 cyber-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900 rounded-2xl flex items-center justify-center text-white border border-white/10 overflow-hidden relative scanlines">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover cyber-image" />
                                ) : (
                                    <span className="text-9xl font-bold opacity-30 select-none neon-text-cyan">{product.title[0]}</span>
                                )}
                            </div>
                            {product.images?.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {product.images.slice(1, 5).map((img, i) => (
                                        <div key={i} className="aspect-square rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-cyan-400 transition">
                                            <img src={img} className="w-full h-full object-cover hover:opacity-80 transition" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="text-cyan-400/80 text-xs font-bold tracking-widest uppercase mb-2 inline-block border border-cyan-400/30 px-3 py-1 rounded">
                                        {product.category}
                                    </span>
                                    <h1 className="text-4xl font-bold text-white mb-2 leading-tight glitch-text" style={{ textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>{product.title}</h1>
                                    <div className="flex items-center space-x-2 text-sm text-gray-400 font-mono">
                                        <span>ID: {product.sku || 'N/A'}</span>
                                        <span className="text-cyan-500">•</span>
                                        <span className={`cyber-badge ${product.stock > 0 ? 'cyber-badge-green' : 'cyber-badge-red'}`}>
                                            {product.stock > 0 ? 'IN STOCK' : 'DEPLETED'}
                                        </span>
                                    </div>
                                </div>
                                {isOwner && (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => navigate(`/products/${product._id}/edit`)}
                                            className="cyber-btn-mini"
                                            title="Edit Protocol"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="cyber-btn-mini !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white hover:!shadow-red-500/50"
                                            title="Terminate Protocol"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline space-x-4">
                                    <span className="text-5xl cyber-price">
                                        ${product.price}
                                    </span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <>
                                            <span className="text-2xl text-gray-600 line-through decoration-pink-500/50 decoration-2 font-mono">${product.compareAtPrice}</span>
                                            <span className="cyber-badge cyber-badge-green border-none !bg-pink-500/20 !text-pink-400 !border-pink-500 !box-shadow-pink-500">
                                                SAVE {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8 mb-10">
                                {product.description && (
                                    <div>
                                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center">
                                            <span className="w-1.5 h-4 bg-cyan-400 mr-3"></span>
                                            Data Log
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-lg border-l border-white/10 pl-4">{product.description}</p>
                                    </div>
                                )}

                                {product.tags && product.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">Keywords</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag) => (
                                                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs font-mono uppercase hover:border-cyan-400/50 hover:text-cyan-400 transition cursor-default">
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
                                    className="cyber-btn w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <span className="flex items-center justify-center space-x-3">
                                        <span>{loading ? 'INITIALIZING...' : product.stock > 0 ? 'ACQUIRE ASSET' : 'UNAVAILABLE'}</span>
                                        {!loading && product.stock > 0 && <span className="group-hover:translate-x-1 transition-transform">⚡</span>}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI SIMILAR PRODUCTS SECTION */}
                {similarProducts.length > 0 && (
                    <div className="mt-20 cyber-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest"><span className="neon-text-pink">Neural</span> Matches</h2>
                                <p className="text-cyan-500/70 font-mono text-sm">Similarity Score &gt; 85%</p>
                            </div>
                            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-pink-500/50 to-transparent mx-10 mb-4"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((p) => (
                                <div
                                    key={p._id}
                                    onClick={() => {
                                        navigate(`/products/${p._id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                    className="cyber-card group cursor-pointer p-0"
                                >
                                    <div className="aspect-square bg-slate-900 relative overflow-hidden">
                                        {p.images?.[0] ? (
                                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover cyber-image" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold opacity-20 text-white">
                                                {p.title[0]}
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md text-[10px] text-cyan-400 border border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                                            MATCHED
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-white/5">
                                        <h4 className="text-white font-bold truncate mb-1 text-sm cyber-underline">{p.title}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="cyber-price text-sm">${p.price}</span>
                                            <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{p.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ProductDetailPage;
