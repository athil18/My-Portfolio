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
                    <Link to="/products/create" className="premium-btn">
                        + Create Product
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-4 border border-white/20">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search products... (min 2 chars)"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchInput && (
                                <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                    ×
                                </button>
                            )}
                            {/* Recent Searches Dropdown */}
                            {searchInput === '' && recentSearches.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg border border-white/20 z-10">
                                    <p className="text-xs text-gray-400 px-3 py-2">Recent:</p>
                                    {recentSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setSearchInput(term)}
                                            className="w-full text-left px-3 py-2 text-white hover:bg-white/10"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px - 4 py - 2 rounded - lg flex items - center gap - 2 transition ${showFilters ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'} `}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters {activeFilterCount > 0 && <span className="px-2 py-0.5 bg-purple-500 rounded-full text-xs">{activeFilterCount}</span>}
                        </button>
                        {/* Sort Dropdown */}
                        <select
                            value={`${filters.sortBy} -${filters.sortOrder} `}
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-');
                                setSearchParams((params) => {
                                    params.set('sortBy', sortBy);
                                    params.set('sortOrder', sortOrder);
                                    return params;
                                });
                            }}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="title-asc">Title A-Z</option>
                            <option value="title-desc">Title Z-A</option>
                            <option value="price-asc">Price Low-High</option>
                            <option value="price-desc">Price High-Low</option>
                            <option value="updatedAt-desc">Recently Updated</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition">
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="">All Categories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                            <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
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
                    <div className="premium-stagger premium-grid">
                        {products.map((product) => (
                            <Link
                                key={product._id}
                                to={`/products/${product._id}`}
                                className="premium-card group"
                            >
                                <div className="h-48 bg-white/50 flex items-center justify-center overflow-hidden relative rounded-lg mb-3">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="premium-image w-full h-full object-contain"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = `<span class="text-5xl font-bold text-gray-400">${product.title[0]}</span>`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-6xl font-bold text-gray-400">
                                            {product.title[0]}
                                        </span>
                                    )}
                                    <div className="absolute top-2 right-2 premium-badge premium-badge-outline text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                        NEW
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const addToCart = async () => {
                                                try {
                                                    await cartService.addToCart(product._id, 1);
                                                    toast.success('ACQUIRED: ' + product.title, { icon: '⚡', style: { background: '#0a0a0f', color: '#00fff2', border: '1px solid #00fff2' } });
                                                } catch (err) { toast.error('FAILED'); }
                                            };
                                            addToCart();
                                        }}
                                        className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center premium-btn premium-btn-icon opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20"
                                        title="Quick Acquire"
                                    >
                                        <span className="text-xl font-bold leading-none">+</span>
                                    </button>
                                </div>
                                <div className="text-center">
                                    <h3 className="premium-product-title mb-1 truncate">{product.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2">${product.price}</p>
                                    <button className="premium-btn premium-btn-sm w-full">
                                        Add to Cart
                                    </button>
                                    <div className="hidden">
                                        <span className="premium-price text-lg">${product.price}</span>
                                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                                            <span className="text-gray-500 line-through text-sm">${product.compareAtPrice}</span>
                                        )}
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
