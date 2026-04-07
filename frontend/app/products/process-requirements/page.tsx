'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Product {
  id: number;
  product_description: string;
}

interface ProcessRequirement {
  id: number;
  product_id: number;
  cut: number | null;
  shave: number | null;
  sharpen: number | null;
  paste: number | null;
  press: number | null;
  staple: number | null;
}

export default function ProductProcessRequirementsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [requirements, setRequirements] = useState<ProcessRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProcessRequirement | null>(null);
  const [form, setForm] = useState({
    product_id: '',
    cut: '',
    shave: '',
    sharpen: '',
    paste: '',
    press: '',
    staple: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products/`);
      if (!response.ok) {
        throw new Error('Unable to load products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorMessage('Unable to load products from the backend.');
    }
  };

  const fetchRequirements = async () => {
    try {
      const response = await fetch(`${API_BASE}/product-process-requirements/`);
      if (!response.ok) {
        throw new Error('Unable to load product process requirements');
      }
      const data = await response.json();
      setRequirements(data);
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setErrorMessage('Unable to load product process requirements.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorMessage('');
      await Promise.all([fetchProducts(), fetchRequirements()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const productId = Number(form.product_id);

    if (!form.product_id.trim() || isNaN(productId) || productId <= 0) {
      errors.product_id = 'Please select a product';
    }

    ['cut', 'shave', 'sharpen', 'paste', 'press', 'staple'].forEach((field) => {
      const value = Number(form[field as keyof typeof form]);
      if (isNaN(value) || value < 0) {
        errors[field] = 'Price must be 0 or greater';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      product_id: '',
      cut: '',
      shave: '',
      sharpen: '',
      paste: '',
      press: '',
      staple: ''
    });
    setFormErrors({});
    setSubmitError('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSubmitError('');

    const productId = Number(form.product_id);
    const hasDuplicate = requirements.some((requirement) => requirement.product_id === productId && (!editing || requirement.id !== editing.id));
    if (hasDuplicate) {
      setSubmitError('There is already process requirements added for this product');
      setSubmitting(false);
      return;
    }

    const payload = {
      product_id: productId,
      cut: Number(form.cut),
      shave: Number(form.shave),
      sharpen: Number(form.sharpen),
      paste: Number(form.paste),
      press: Number(form.press),
      staple: Number(form.staple)
    };

    try {
      const url = editing
        ? `${API_BASE}/product-process-requirements/${editing.id}`
        : `${API_BASE}/product-process-requirements/`;
      const method = editing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save product process requirement');
      }

      await fetchRequirements();
      resetForm();
      alert(editing ? 'Process requirement updated successfully!' : 'Process requirement added successfully!');
    } catch (error) {
      console.error('Error saving requirement:', error);
      setErrorMessage('Failed to save the product process requirement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (requirement: ProcessRequirement) => {
    setEditing(requirement);
    setForm({
      product_id: requirement.product_id.toString(),
      cut: requirement.cut != null ? requirement.cut.toString() : '',
      shave: requirement.shave != null ? requirement.shave.toString() : '',
      sharpen: requirement.sharpen != null ? requirement.sharpen.toString() : '',
      paste: requirement.paste != null ? requirement.paste.toString() : '',
      press: requirement.press != null ? requirement.press.toString() : '',
      staple: requirement.staple != null ? requirement.staple.toString() : ''
    });
    document.getElementById('process-requirement-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this process requirement record?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/product-process-requirements/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete requirement');
      }
      await fetchRequirements();
      alert('Process requirement deleted successfully!');
    } catch (error) {
      console.error('Error deleting requirement:', error);
      alert('Failed to delete process requirement. Please try again.');
    }
  };

  const getProductDescription = (productId: number) => {
    const product = products.find((prod) => prod.id === productId);
    return product ? product.product_description : `Product ${productId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading process requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Process Requirements</h1>
            <p className="text-gray-600">Manage each product's process cost requirements and map them to the product description.</p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-6">
              <strong className="block font-semibold">Unable to save or load records</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          <div id="process-requirement-form" className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {editing ? '✏️ Edit Product Process Requirement' : '➕ Add New Product Process Requirement'}
              </h2>
              <p className="text-gray-600">
                {editing
                  ? 'Update the process requirements for the selected product.'
                  : 'Choose a product and enter its skill process costs.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product *</label>
                  <select
                    value={form.product_id}
                    onChange={(e) => {
                      setForm({ ...form, product_id: e.target.value });
                      setFormErrors((prev) => ({ ...prev, product_id: '' }));
                      setSubmitError('');
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                      formErrors.product_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={submitting || Boolean(editing)}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id.toString()}>
                        {product.product_description}
                      </option>
                    ))}
                  </select>
                  <p className={`mt-1 text-sm ${formErrors.product_id ? 'text-red-600' : 'text-gray-500'}`}>
                    {formErrors.product_id || 'Pick the product this requirement belongs to.'}
                  </p>
                </div>

                {['cut', 'shave', 'sharpen', 'paste', 'press', 'staple'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.charAt(0).toUpperCase() + field.slice(1)} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form[field as keyof typeof form]}
                      onChange={(e) => {
                        setForm({ ...form, [field]: e.target.value });
                        setFormErrors((prev) => ({ ...prev, [field]: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                        formErrors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      required
                      disabled={submitting}
                    />
                    <p className={`mt-1 text-sm ${formErrors[field] ? 'text-red-600' : 'text-gray-500'}`}>
                      {formErrors[field] || `Cost for ${field} process.`}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (editing ? 'Updating...' : 'Adding...') : (editing ? '💾 Update Requirement' : '➕ Add Requirement')}
                </button>

                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-lg bg-gray-500 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ❌ Cancel Edit
                  </button>
                )}
              </div>
              {submitError && (
                <p className="mt-3 text-sm font-medium text-red-600">{submitError}</p>
              )}
            </form>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📋 Process Requirements Records</h2>
            <p className="text-gray-600 mt-1">Review and manage product process requirements mapped to product descriptions.</p>
          </div>

          {requirements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500 mb-4">Add a new process requirement using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">PRODUCT</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cut</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Shave</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sharpen</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Paste</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Press</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Staple</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requirements.map((requirement) => (
                    <tr key={requirement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getProductDescription(requirement.product_id)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{requirement.cut != null ? requirement.cut.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{requirement.shave != null ? requirement.shave.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{requirement.sharpen != null ? requirement.sharpen.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{requirement.paste != null ? requirement.paste.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{requirement.press != null ? requirement.press.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{requirement.staple != null ? requirement.staple.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(requirement)}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(requirement.id)}
                          className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-200 transition"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
