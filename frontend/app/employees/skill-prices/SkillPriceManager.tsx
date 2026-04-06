'use client';

import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8000';

interface Employee {
  id: number;
  name: string;
}

interface SkillPrice {
  id: number;
  employee_id: number;
  cut_price: number | null;
  shave_price: number | null;
  sharpen_price: number | null;
  paste_price: number | null;
  press_price: number | null;
  staple_price: number | null;
}

export default function SkillPriceManager() {
  const [prices, setPrices] = useState<SkillPrice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [editing, setEditing] = useState<SkillPrice | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    cut_price: '',
    shave_price: '',
    sharpen_price: '',
    paste_price: '',
    press_price: '',
    staple_price: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // Filter state for employee name
  const [filterEmployee, setFilterEmployee] = useState('');

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!form.employee_id.trim() || Number(form.employee_id) <= 0) {
      errors.employee_id = 'Valid employee ID is required';
    }

    ['cut_price', 'shave_price', 'sharpen_price', 'paste_price', 'press_price', 'staple_price'].forEach((field) => {
      const value = Number(form[field as keyof typeof form]);
      if (isNaN(value) || value < 0) {
        errors[field] = 'Price must be 0 or greater';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchPrices = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE}/employee-skill-prices/`);
      if (!response.ok) {
        throw new Error(`Unable to load skill prices (${response.status})`);
      }
      const data = await response.json();
      setPrices(data);
    } catch (error) {
      console.error('Error fetching skill prices:', error);
      setErrorMessage('Could not load employee skill prices. Please ensure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await fetch(`${API_BASE}/employees/`);
      if (!response.ok) {
        throw new Error('Unable to load employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPrices(), fetchEmployees()]);
    };
    loadData();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      employee_id: '',
      cut_price: '',
      shave_price: '',
      sharpen_price: '',
      paste_price: '',
      press_price: '',
      staple_price: ''
    });
    setFormErrors({});
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    const employeeId = Number(form.employee_id);
    const hasDuplicate = prices.some((price) => price.employee_id === employeeId && (!editing || price.id !== editing.id));
    if (hasDuplicate) {
      setSubmitError('There is already skill price added for this employee');
      setSubmitting(false);
      return;
    }

    const payload = {
      employee_id: employeeId,
      cut_price: Number(form.cut_price),
      shave_price: Number(form.shave_price),
      sharpen_price: Number(form.sharpen_price),
      paste_price: Number(form.paste_price),
      press_price: Number(form.press_price),
      staple_price: Number(form.staple_price)
    };

    try {
      const url = editing ? `${API_BASE}/employee-skill-prices/${editing.id}` : `${API_BASE}/employee-skill-prices/`;
      const method = editing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save skill price');
      }

      await fetchPrices();
      resetForm();
      alert(editing ? 'Skill price updated successfully!' : 'Skill price added successfully!');
    } catch (error) {
      console.error('Error saving skill price:', error);
      alert('Failed to save skill price. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (price: SkillPrice) => {
    setEditing(price);
    setForm({
      employee_id: price.employee_id.toString(),
      cut_price: price.cut_price ? price.cut_price.toString() : '',
      shave_price: price.shave_price ? price.shave_price.toString() : '',
      sharpen_price: price.sharpen_price ? price.sharpen_price.toString() : '',
      paste_price: price.paste_price ? price.paste_price.toString() : '',
      press_price: price.press_price ? price.press_price.toString() : '',
      staple_price: price.staple_price ? price.staple_price.toString() : ''
    });
    document.getElementById('skill-price-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill price record?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/employee-skill-prices/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete skill price');
      }
      await fetchPrices();
      alert('Skill price record deleted successfully!');
    } catch (error) {
      console.error('Error deleting skill price:', error);
      alert('Failed to delete skill price. Please try again.');
    }
  };

  if (loading || employeesLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill price data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <strong className="block font-semibold">Unable to load data</strong>
          <p>{errorMessage}</p>
        </div>
      )}

      <div id="skill-price-form" className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {editing ? '✏️ Edit Skill Price Record' : '➕ Add Skill Price Record'}
          </h2>
          <p className="text-gray-600">
            {editing ? 'Update skill costs for an employee.' : 'Create a new employee skill price record.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Name *</label>
              <select
                value={form.employee_id}
                onChange={(e) => {
                  setForm({ ...form, employee_id: e.target.value });
                  setSubmitError('');
                }}
                onFocus={() => {
                  setFormErrors(prev => ({ ...prev, employee_id: '' }));
                  setSubmitError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                  formErrors.employee_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={submitting || Boolean(editing)}
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <p className={`mt-1 text-sm ${formErrors.employee_id ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.employee_id || 'Choose the employee for this skill price record.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cut Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cut_price}
                onChange={(e) => setForm({ ...form, cut_price: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, cut_price: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.cut_price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.cut_price ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.cut_price || 'Hourly or unit price for cutting skill.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shave Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.shave_price}
                onChange={(e) => setForm({ ...form, shave_price: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, shave_price: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.shave_price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.shave_price ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.shave_price || 'Cost for shaving skill.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sharpen Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sharpen_price}
                onChange={(e) => setForm({ ...form, sharpen_price: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, sharpen_price: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.sharpen_price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.sharpen_price ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.sharpen_price || 'Cost for sharpening skill.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Paste Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.paste_price}
                onChange={(e) => setForm({ ...form, paste_price: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, paste_price: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.paste_price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.paste_price ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.paste_price || 'Cost for paste skill.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Press Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.press_price}
                onChange={(e) => setForm({ ...form, press_price: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, press_price: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.press_price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.press_price ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.press_price || 'Cost for press skill.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Staple Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.staple_price}
                onChange={(e) => setForm({ ...form, staple_price: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, staple_price: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.staple_price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.staple_price ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.staple_price || 'Cost for staple skill.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (editing ? 'Updating...' : 'Adding...') : (editing ? '💾 Update Record' : '➕ Add Record')}
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

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">📊 Skill Price Records</h2>
            <p className="text-gray-600 mt-1">Review and manage employee skill pricing entries.</p>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <label htmlFor="employee-filter" className="text-sm font-medium text-gray-700">Filter by Employee:</label>
            <input
              id="employee-filter"
              type="text"
              value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}
              placeholder="Enter employee name"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
            />
          </div>
        </div>

        {/* Filter prices by employee name */}
        {prices.filter(price => {
          if (!filterEmployee.trim()) return true;
          const employee = employees.find(e => e.id === price.employee_id);
          return employee && employee.name.toLowerCase().includes(filterEmployee.trim().toLowerCase());
        }).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-500 mb-4">Add a new skill price record using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee Name</th>
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
                {prices.filter(price => {
                  if (!filterEmployee.trim()) return true;
                  const employee = employees.find(e => e.id === price.employee_id);
                  return employee && employee.name.toLowerCase().includes(filterEmployee.trim().toLowerCase());
                }).map((price) => {
                  const employee = employees.find(e => e.id === price.employee_id);
                  return (
                    <tr key={price.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{employee ? employee.name : `Employee ${price.employee_id}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${price.cut_price ? price.cut_price.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${price.shave_price ? price.shave_price.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${price.sharpen_price ? price.sharpen_price.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${price.paste_price ? price.paste_price.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${price.press_price ? price.press_price.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${price.staple_price ? price.staple_price.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(price)}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(price.id)}
                          className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-200 transition"
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
