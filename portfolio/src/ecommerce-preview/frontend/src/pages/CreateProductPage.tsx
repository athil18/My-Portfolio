import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { CreateProductData } from '../services/productService';
import toast, { Toaster } from 'react-hot-toast';

const CreateProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateProductData>({
        title: '',
        description: '',
        price: 0,
        compareAtPrice: 0,
        category: '',
        tags: [],
        images: [],
        stock: 0,
        status: 'draft',
        priority: 'medium',
        sku: '',
    });
    const [tagInput, setTagInput] = useState('');

    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];

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

    const validateForm = (): boolean => {
        if (formData.title.length < 3 || formData.title.length > 200) {
            toast.error('Title must be between 3 and 200 characters');
            return false;
        }
        if (formData.description && formData.description.length > 5000) {
            toast.error('Description cannot exceed 5000 characters');
            return false;
        }
        if (formData.price < 0) {
            toast.error('Price cannot be negative');
            return false;
        }
        if (!formData.category) {
            toast.error('Please select a category');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent, saveAs: 'draft' | 'active' = 'active') => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                status: saveAs,
                compareAtPrice: formData.compareAtPrice || undefined,
                sku: formData.sku || undefined,
            };

            await productService.createProduct(dataToSubmit);
            toast.success(`Product ${saveAs === 'draft' ? 'saved as draft' : 'created'} successfully!`);
            setTimeout(() => navigate('/products/my-products'), 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Create New Product</h1>
                    <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
                        Cancel
                    </button>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                    <form onSubmit={(e) => handleSubmit(e, 'active')} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                minLength={3}
                                maxLength={200}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter product title"
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                maxLength={5000}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Describe your product..."
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.description?.length || 0}/5000</p>
                        </div>

                        {/* Price & Compare Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Price <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Compare at Price</label>
                                <input
                                    type="number"
                                    name="compareAtPrice"
                                    value={formData.compareAtPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Category & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Category <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Priority & SKU */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">SKU (optional)</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Product SKU"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Tags</label>
                            <div className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Add a tag..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                                >
                                    Add
                                </button>
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

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Product'}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e as any, 'draft')}
                                disabled={loading}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition disabled:opacity-50"
                            >
                                Save as Draft
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProductPage;
