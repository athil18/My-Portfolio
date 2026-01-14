import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../services/productService';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const ProductsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        const saved = localStorage.getItem('recentProductSearches');
        return saved ? JSON.parse(saved) : [];
    });
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

    // Initialize from URL
    const filters = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        status: searchParams.get('status') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    useEffect(() => {
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 12;
        setPagination(p => ({ ...p, page, limit }));
        fetchProducts(page, limit);
    }, [searchParams]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput.length >= 2 || searchInput === '') {
                updateFilter('search', searchInput);
                if (searchInput.length >= 2) {
                    saveRecentSearch(searchInput);
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchProducts = async (page: number, limit: number) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                ...(filters.search && { search: filters.search }),
                ...(filters.category && { category: filters.category }),
                ...(filters.status && { status: filters.status }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            };
            const response = await productService.getProducts(params);
            setProducts(response.data.products);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key: string, value: string) => {
        setSearchParams((params) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            params.set('page', '1');
            return params;
        });
    };

    const clearFilters = () => {
        setSearchParams({ page: '1', limit: String(pagination.limit) });
        setSearchInput('');
    };

    const saveRecentSearch = (term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentProductSearches', JSON.stringify(updated));
    };

    const activeFilterCount = [filters.category, filters.status, filters.minPrice, filters.maxPrice].filter(Boolean).length;

    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];

    return (
        <div className="min-h-screen premium-bg py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-white">Browse Products</h1>
                    <div className="flex gap-4">
                        <Link to="/cart" className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-cyan-400 border border-cyan-400/30 rounded-lg hover:bg-slate-700 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            View Cart
                        </Link>
                        <Link to="/products/create" className="premium-btn">
                            + Create Product
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <svg className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products... (min 2 chars)"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full px-4 py-3.5 pl-12 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-slate-700/70 transition-all duration-300"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-2xl leading-none transition-colors"
                                >
                                    ×
                                </button>
                            )}
                            {/* Recent Searches Dropdown */}
                            {searchInput === '' && recentSearches.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border-2 border-purple-500/30 shadow-2xl z-10 overflow-hidden">
                                    <p className="text-xs text-purple-400 px-4 py-2 bg-slate-900/50 font-semibold">Recent Searches</p>
                                    {recentSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setSearchInput(term)}
                                            className="w-full text-left px-4 py-2.5 text-white hover:bg-purple-600/20 transition-colors border-t border-slate-700/50"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 font-medium whitespace-nowrap ${showFilters
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border-2 border-slate-600'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="px-2.5 py-0.5 bg-purple-400 text-purple-900 rounded-full text-xs font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={`${filters.sortBy}-${filters.sortOrder}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] = e.target.value.split('-');
                                    setSearchParams((params) => {
                                        params.set('sortBy', sortBy);
                                        params.set('sortOrder', sortOrder);
                                        return params;
                                    });
                                }}
                                className="appearance-none px-6 py-3.5 pr-12 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer font-medium transition-all duration-300 hover:bg-slate-700"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="createdAt-desc" className="bg-slate-800 text-white">Newest First</option>
                                <option value="createdAt-asc" className="bg-slate-800 text-white">Oldest First</option>
                                <option value="title-asc" className="bg-slate-800 text-white">Title A-Z</option>
                                <option value="title-desc" className="bg-slate-800 text-white">Title Z-A</option>
                                <option value="price-asc" className="bg-slate-800 text-white">Price Low-High</option>
                                <option value="price-desc" className="bg-slate-800 text-white">Price High-Low</option>
                                <option value="updatedAt-desc" className="bg-slate-800 text-white">Recently Updated</option>
                            </select>
                            <svg className="w-5 h-5 text-purple-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Clear Filters */}
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3.5 bg-red-600/20 border-2 border-red-500/50 text-red-400 rounded-xl hover:bg-red-600/30 hover:border-red-500 transition-all duration-300 font-medium whitespace-nowrap"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="pt-4 border-t-2 border-slate-700/50 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
                            <div className="relative">
                                <select
                                    value={filters.category}
                                    onChange={(e) => updateFilter('category', e.target.value)}
                                    className="appearance-none w-full px-4 py-3 pr-10 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300"
                                    style={{ colorScheme: 'dark' }}
                                >
                                    <option value="" className="bg-slate-800 text-white">All Categories</option>
                                    {categories.map(cat => <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>)}
                                </select>
                                <svg className="w-4 h-4 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            <div className="relative">
                                <select
                                    value={filters.status}
                                    onChange={(e) => updateFilter('status', e.target.value)}
                                    className="appearance-none w-full px-4 py-3 pr-10 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300"
                                    style={{ colorScheme: 'dark' }}
                                >
                                    <option value="" className="bg-slate-800 text-white">All Statuses</option>
                                    <option value="draft" className="bg-slate-800 text-white">Draft</option>
                                    <option value="active" className="bg-slate-800 text-white">Active</option>
                                    <option value="archived" className="bg-slate-800 text-white">Archived</option>
                                </select>
                                <svg className="w-4 h-4 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            <input
                                type="number"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={(e) => updateFilter('minPrice', e.target.value)}
                                className="px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                            />

                            <input
                                type="number"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                className="px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                            />
                        </div>
                    )}
                </div>

                {/* Active Filter Chips */}
                {(filters.category || filters.status) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filters.category && (
                            <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm flex items-center gap-2">
                                Category: {filters.category}
                                <button onClick={() => updateFilter('category', '')} className="hover:text-red-300">×</button>
                            </span>
                        )}
                        {filters.status && (
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-2">
                                Status: {filters.status}
                                <button onClick={() => updateFilter('status', '')} className="hover:text-red-300">×</button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results Count */}
                <p className="text-gray-400 mb-4">
                    {loading ? 'Loading...' : `${pagination.total} products found`}
                </p>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white/10 rounded-xl h-72 animate-pulse" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                        <p className="text-gray-400 mb-4">No products found</p>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product._id}
                                to={`/products/${product._id}`}
                                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group flex flex-col"
                            >
                                <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center overflow-hidden relative mb-4">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = `<span class="text-5xl font-bold text-gray-400">${product.title[0]}</span>`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-5xl font-bold text-gray-400">
                                            {product.title[0]}
                                        </span>
                                    )}
                                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        NEW
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const addToCart = async () => {
                                                try {
                                                    await cartService.addToCart(product._id, 1);
                                                    toast.success('Added to cart!', { icon: '🛒' });
                                                } catch (err) { toast.error('Failed to add'); }
                                            };
                                            addToCart();
                                        }}
                                        className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                                        title="Quick Add"
                                    >
                                        <span className="text-xl font-bold leading-none">+</span>
                                    </button>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{product.title}</h3>
                                    <div className="mt-auto">
                                        <p className="text-purple-400 font-bold text-lg mb-3">${product.price.toFixed(2)}</p>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const addToCart = async () => {
                                                    try {
                                                        await cartService.addToCart(product._id, 1);
                                                        toast.success('Added to cart!', { icon: '🛒' });
                                                    } catch (err) { toast.error('Failed to add'); }
                                                };
                                                addToCart();
                                            }}
                                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-300"
                                        >
                                            Add To Cart
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}




                {/* Pagination */}
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={(page) => setPagination(p => ({ ...p, page }))}
                    onLimitChange={(limit) => setPagination(p => ({ ...p, limit, page: 1 }))}
                />
            </div>
        </div>

    );
};

export default ProductsPage;
