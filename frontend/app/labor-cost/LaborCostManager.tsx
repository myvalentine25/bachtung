'use client';

import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

interface Employee {
  id: number;
  name: string;
}

interface Product {
  id: number;
  product_description: string;
}

interface LaborOutput {
  id: number;
  employee_id: number;
  work_date: string;
  cut_output: number;
  shave_output: number;
  sharpen_output: number;
  paste_output: number;
  press_output: number;
  staple_output: number;
  product_id: number;
}

export default function LaborCostManager() {
  const [outputs, setOutputs] = useState<LaborOutput[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LaborOutput | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    work_date: '',
    cut_output: '',
    shave_output: '',
    sharpen_output: '',
    paste_output: '',
    press_output: '',
    staple_output: '',
    product_id: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDate, setFilterDate] = useState('');
  // Filter state for employee name
  const [filterEmployee, setFilterEmployee] = useState('');
  // Filter state for product description
  const [filterProduct, setFilterProduct] = useState('');

  useEffect(() => {
    Promise.all([fetchOutputs(), fetchEmployees(), fetchProducts()]);
  }, []);

  const fetchOutputs = async () => {
    setErrorMessage('');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/employee-outputs/`);
      if (!response.ok) {
        throw new Error(`Unable to load outputs (${response.status})`);
      }
      const data = await response.json();
      setOutputs(data);
    } catch (error) {
      console.error('Error fetching outputs:', error);
      setErrorMessage('Could not load labor cost records. Please ensure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/employees/`);
      if (!response.ok) throw new Error('Unable to load employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products/`);
      if (!response.ok) throw new Error('Unable to load products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  const getProductDescription = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.product_description : `Product ${productId}`;
  };

  const getUniqueMonths = () => {
    const months = new Set<string>();
    outputs.forEach((output) => {
      if (output.work_date) {
        months.add(output.work_date.slice(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  };

  const filteredOutputs = outputs.filter((output) => {
    if (filterMonth && output.work_date.slice(0, 7) !== filterMonth) {
      return false;
    }
    if (filterDate && output.work_date !== filterDate) {
      return false;
    }
    if (filterEmployee.trim()) {
      const employee = employees.find(e => e.id === output.employee_id);
      if (!employee || !employee.name.toLowerCase().includes(filterEmployee.trim().toLowerCase())) {
        return false;
      }
    }
    if (filterProduct.trim()) {
      const product = products.find(p => p.id === output.product_id);
      if (!product || !product.product_description.toLowerCase().includes(filterProduct.trim().toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!form.employee_id) {
      errors.employee_id = 'Employee is required';
    }
    if (!form.work_date) {
      errors.work_date = 'Work date is required';
    }
    if (!form.product_id) {
      errors.product_id = 'Product is required';
    }

    const numFields = ['cut_output', 'shave_output', 'sharpen_output', 'paste_output', 'press_output', 'staple_output'];
    numFields.forEach((field) => {
      const value = Number(form[field as keyof typeof form]);
      if (isNaN(value) || value < 0) {
        errors[field] = 'Output must be 0 or greater';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const outputData = {
      employee_id: parseInt(form.employee_id),
      work_date: form.work_date,
      cut_output: parseFloat(form.cut_output),
      shave_output: parseFloat(form.shave_output),
      sharpen_output: parseFloat(form.sharpen_output),
      paste_output: parseFloat(form.paste_output),
      press_output: parseFloat(form.press_output),
      staple_output: parseFloat(form.staple_output),
      product_id: parseInt(form.product_id)
    };

    try {
      const url = editing ? `${API_BASE}/employee-outputs/${editing.id}` : `${API_BASE}/employee-outputs/`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outputData)
      });

      if (!response.ok) throw new Error('Failed to save output');

      await fetchOutputs();
      resetForm();
      alert(editing ? 'Record updated successfully!' : 'Record added successfully!');
    } catch (error) {
      console.error('Error saving output:', error);
      alert('Failed to save record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/employee-outputs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete output');

      await fetchOutputs();
      alert('Record deleted successfully!');
    } catch (error) {
      console.error('Error deleting output:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  const handleEdit = (output: LaborOutput) => {
    setEditing(output);
    setForm({
      employee_id: output.employee_id.toString(),
      work_date: output.work_date,
      cut_output: output.cut_output.toString(),
      shave_output: output.shave_output.toString(),
      sharpen_output: output.sharpen_output.toString(),
      paste_output: output.paste_output.toString(),
      press_output: output.press_output.toString(),
      staple_output: output.staple_output.toString(),
      product_id: output.product_id.toString()
    });
    document.getElementById('labor-cost-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      employee_id: '',
      work_date: '',
      cut_output: '',
      shave_output: '',
      sharpen_output: '',
      paste_output: '',
      press_output: '',
      staple_output: '',
      product_id: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading labor cost records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {errorMessage && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <strong className="block font-semibold">Unable to load records</strong>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <div id="labor-cost-form" className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {editing ? '✏️ Edit Labor Cost Record' : '➕ Add Labor Cost Record'}
          </h2>
          <p className="text-gray-600">
            {editing ? 'Update the labor output data.' : 'Record the daily work output for an employee.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Employee *</label>
              <select
                value={form.employee_id}
                onChange={(e) => {
                  setForm({ ...form, employee_id: e.target.value });
                  setFormErrors((prev) => ({ ...prev, employee_id: '' }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                  formErrors.employee_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={submitting || Boolean(editing)}
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id.toString()}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <p className={`mt-1 text-sm ${formErrors.employee_id ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.employee_id || 'Select the employee who produced'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Work Date *</label>
              <input
                type="date"
                value={form.work_date}
                onChange={(e) => {
                  setForm({ ...form, work_date: e.target.value });
                  setFormErrors((prev) => ({ ...prev, work_date: '' }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                  formErrors.work_date ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.work_date ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.work_date || 'Date of work production'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product *</label>
              <select
                value={form.product_id}
                onChange={(e) => {
                  setForm({ ...form, product_id: e.target.value });
                  setFormErrors((prev) => ({ ...prev, product_id: '' }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                  formErrors.product_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={submitting}
              >
                <option value="">Select a product</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id.toString()}>
                    {prod.product_description}
                  </option>
                ))}
              </select>
              <p className={`mt-1 text-sm ${formErrors.product_id ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.product_id || 'Select the product being produced'}
              </p>
            </div>

            {['cut_output', 'shave_output', 'sharpen_output', 'paste_output', 'press_output', 'staple_output'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.replace('_output', '').charAt(0).toUpperCase() + field.replace('_output', '').slice(1)} Output *
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
                  {formErrors[field] || `Number of units for ${field.replace('_output', '')}`}
                </p>
              </div>
            ))}
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
                  {editing ? '💾 Update Record' : '➕ Add Record'}
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

      {/* Records Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">📋 Labor Cost Records</h2>
          <p className="text-gray-600 mt-1">View and manage all labor cost records</p>
        </div>
        <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-semibold text-gray-700">Filter by Month:</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All months</option>
                {getUniqueMonths().map((month) => (
                  <option key={month} value={month}>
                    {new Date(`${month}-01`).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-semibold text-gray-700">Filter by Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-semibold text-gray-700">Filter by Employee:</label>
              <input
                type="text"
                value={filterEmployee}
                onChange={e => setFilterEmployee(e.target.value)}
                placeholder="Enter employee name"
                className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-semibold text-gray-700">Filter by Product:</label>
              <input
                type="text"
                value={filterProduct}
                onChange={e => setFilterProduct(e.target.value)}
                placeholder="Enter product description"
                className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterMonth('');
                setFilterDate('');
                setFilterEmployee('');
                setFilterProduct('');
              }}
              className="inline-flex items-center justify-center rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {filteredOutputs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-500 mb-4">Add a new labor cost record using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Date</th>
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
                {filteredOutputs.map((output) => (
                  <tr key={output.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{getEmployeeName(output.employee_id)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{getProductDescription(output.product_id)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{output.work_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{output.cut_output.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{output.shave_output.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{output.sharpen_output.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{output.paste_output.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{output.press_output.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{output.staple_output.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(output)}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(output.id)}
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
  );
}
