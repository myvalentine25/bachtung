'use client';

import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

interface Product {
  id: number;
  product_description: string;
  cost: number;
  price: number;
  labor_cost: number;
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    product_description: '',
    cost: '',
    price: '',
    labor_cost: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [productFilter, setProductFilter] = useState('');

  const fetchProducts = async () => {
    setErrorMessage('');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products/`);
      if (!response.ok) {
        throw new Error(`Unable to load products (${response.status})`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorMessage('Could not load products. Please make sure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!form.product_description.trim()) {
      errors.product_description = 'Product name is required';
    } else if (form.product_description.length < 3) {
      errors.product_description = 'Product name must be at least 3 characters';
    }

    const cost = parseFloat(form.cost);
    const price = parseFloat(form.price);
    const laborCost = parseFloat(form.labor_cost);

    if (isNaN(cost) || cost < 0) {
      errors.cost = 'Manufacturing cost must be a positive number';
    }

    if (isNaN(price) || price < 0) {
      errors.price = 'Selling price must be a positive number';
    } else if (price <= cost) {
      errors.price = 'Selling price must be greater than manufacturing cost';
    }

    if (isNaN(laborCost) || laborCost < 0) {
      errors.labor_cost = 'Labor cost must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const productData = {
      product_description: form.product_description.trim(),
      cost: parseFloat(form.cost),
      price: parseFloat(form.price),
      labor_cost: parseFloat(form.labor_cost)
    };

    // Basic validation
    if (!productData.product_description) {
      alert('Please enter a product description');
      setSubmitting(false);
      return;
    }
    if (productData.cost <= 0 || productData.price <= 0 || productData.labor_cost <= 0) {
      alert('All cost values must be greater than 0');
      setSubmitting(false);
      return;
    }

    try {
      const url = editing
        ? `${API_BASE}/products/${editing.id}`
        : `${API_BASE}/products/`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('Failed to save product');

      await fetchProducts();
      resetForm();
      alert(editing ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete product');

      await fetchProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      product_description: product.product_description,
      cost: product.cost.toString(),
      price: product.price.toString(),
      labor_cost: product.labor_cost.toString()
    });
    // Scroll to form
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      product_description: '',
      cost: '',
      price: '',
      labor_cost: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {errorMessage && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <strong className="block font-semibold">Unable to load products</strong>
          <p>{errorMessage}</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              ${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              ${(products.reduce((sum, p) => sum + p.cost + p.labor_cost, 0) / products.length).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Avg. Cost per Product</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {products.length > 0 ?
                (products.reduce((sum, p) => {
                  const totalCost = p.cost + p.labor_cost;
                  const profit = p.price - totalCost;
                  return sum + (totalCost > 0 ? (profit / totalCost) * 100 : 0);
                }, 0) / products.length).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg. Profit Margin</div>
          </div>
        </div>
      )}

        {/* Form */}
        <div id="product-form" className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {editing ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <p className="text-gray-600">
              {editing ? 'Update the product information below' : 'Fill in the details to add a new product to your inventory'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📦 Product Name & Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.product_description}
                  onChange={(e) => setForm({...form, product_description: e.target.value})}
                  onFocus={() => setFormErrors(prev => ({...prev, product_description: ''}))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                    formErrors.product_description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name: e.g., 'Conveyor Roller Φ60mm', 'PVC Belt 2-Ply Green', 'Stainless Steel Roller Φ49mm'"
                  required
                  disabled={submitting}
                  maxLength={100}
                />
                <div className="mt-1 flex justify-between items-center">
                  {formErrors.product_description ? (
                    <p className="text-sm text-red-600">{formErrors.product_description}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Clear, descriptive name that identifies this product</p>
                  )}
                  <span className={`text-xs ${form.product_description.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>
                    {form.product_description.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 Manufacturing Cost <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm({...form, cost: e.target.value})}
                    onFocus={() => setFormErrors(prev => ({...prev, cost: ''}))}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                      formErrors.cost ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="50000.00"
                    required
                    disabled={submitting}
                  />
                </div>
                <p className={`mt-1 text-sm ${formErrors.cost ? 'text-red-600' : 'text-gray-500'}`}>
                  {formErrors.cost || 'Raw materials + direct production costs per unit'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Selling Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    onFocus={() => setFormErrors(prev => ({...prev, price: ''}))}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                      formErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="80000.00"
                    required
                    disabled={submitting}
                  />
                </div>
                <p className={`mt-1 text-sm ${formErrors.price ? 'text-red-600' : 'text-gray-500'}`}>
                  {formErrors.price || 'Final price customers pay (must be > cost)'}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👷 Labor Cost <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.labor_cost}
                    onChange={(e) => setForm({...form, labor_cost: e.target.value})}
                    onFocus={() => setFormErrors(prev => ({...prev, labor_cost: ''}))}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                      formErrors.labor_cost ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="5000.00"
                    required
                    disabled={submitting}
                  />
                </div>
                <p className={`mt-1 text-sm ${formErrors.labor_cost ? 'text-red-600' : 'text-gray-500'}`}>
                  {formErrors.labor_cost || 'Total wages, benefits, and labor overhead per unit'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {editing ? '💾 Update Product' : '➕ Add Product'}
                  </>
                )}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ❌ Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📦 Product Inventory</h2>
            <p className="text-gray-600 mt-1">View and manage all your products</p>
          </div>

          {/* Product Filter */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
            <label htmlFor="product-filter" className="text-sm font-semibold text-gray-700">Filter by Product:</label>
            <input
              id="product-filter"
              type="text"
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              placeholder="Type to filter by product description..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 w-full md:w-80"
            />
          </div>
          {(products.length === 0 || products.filter(p => p.product_description.toLowerCase().includes(productFilter.toLowerCase())).length === 0) ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">{products.length === 0 ? 'Get started by adding your first product above' : 'No products match your filter'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Manufacturing Cost
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Labor Cost
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Profit Margin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products
                    .filter(product => product.product_description.toLowerCase().includes(productFilter.toLowerCase()))
                    .map((product) => {
                    const totalCost = product.cost + product.labor_cost;
                    const profit = product.price - totalCost;
                    const marginPercent = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{product.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {product.product_description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${product.cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${product.labor_cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marginPercent >= 0 ? '+' : ''}{marginPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

    </div>
  );
}