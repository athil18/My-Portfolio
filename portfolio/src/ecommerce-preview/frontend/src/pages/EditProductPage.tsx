import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { CreateProductData } from '../services/productService';
import toast, { Toaster } from 'react-hot-toast';

const EditProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [originalData, setOriginalData] = useState<CreateProductData | null>(null);
    const [formData, setFormData] = useState<CreateProductData>({
        title: '',
        description: '',
        price: 0,
        compareAtPrice: 0,
        category: '',
        tags: [],
        stock: 0,
        status: 'draft',
        priority: 'medium',
        sku: '',
    });
    const [tagInput, setTagInput] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    useEffect(() => {
        if (originalData) {
            const dirty = JSON.stringify(formData) !== JSON.stringify(originalData);
            setIsDirty(dirty);
        }
    }, [formData, originalData]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        if (isDirty && formData.status === 'draft') {
            if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
            autoSaveTimeout.current = setTimeout(async () => {
                try {
                    await productService.patchProduct(id!, formData);
                    toast.success('Draft auto-saved', { duration: 2000 });
                } catch (error) {
                }
            }, 5000);
        }
        return () => {
            if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
        };
    }, [formData, isDirty, id]);

    const fetchProduct = async () => {
        try {
            const response = await productService.getProduct(id!);
            const product = response.data;
            const data: CreateProductData = {
                title: product.title,
                description: product.description || '',
                price: product.price,
                compareAtPrice: product.compareAtPrice || 0,
                category: product.category,
                tags: product.tags || [],
                stock: product.stock,
                status: product.status,
                priority: product.priority,
                sku: product.sku || '',
            };
            setFormData(data);
            setOriginalData(data);
        } catch (error) {
            toast.error('Failed to load product');
            navigate('/products/my-products');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'price' || name === 'compareAtPrice' || name === 'stock' ? Number(value) : value });
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags?.filter((t) => t !== tag) || [] });
    };

    const handleCancel = () => {
        if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
            return;
        }
        navigate(-1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await productService.updateProduct(id!, formData);
            setOriginalData(formData);
            setIsDirty(false);
            toast.success('Product updated successfully!');
            setTimeout(() => navigate(`/products/${id}`), 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Edit Product</h1>
                        {isDirty && <span className="text-yellow-400 text-sm">● Unsaved changes</span>}
                    </div>
                    <button onClick={handleCancel} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
                        Cancel
                    </button>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Price *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Compare Price</label>
                                <input type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} min="0" step="0.01" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Category *</label>
                                <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Stock</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">SKU</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Tags</label>
                            <div className="flex space-x-2 mb-2">
                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Add a tag..." />
                                <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags?.map((tag) => (
                                    <span key={tag} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm flex items-center">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-red-300">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !isDirty} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                            {loading ? 'Updating...' : isDirty ? 'Save Changes' : 'No Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;
