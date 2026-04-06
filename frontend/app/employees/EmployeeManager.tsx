'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Employee {
  id: number;
  name: string;
  birthday: string;
  address: string;
}

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    name: '',
    birthday: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!form.name.trim()) {
      errors.name = 'Employee name is required';
    }

    if (!form.birthday) {
      errors.birthday = 'Birthday is required';
    }

    if (!form.address.trim()) {
      errors.address = 'Address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchEmployees = async () => {
    setErrorMessage('');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/employees/`);
      if (!response.ok) {
        throw new Error(`Unable to load employees (${response.status})`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setErrorMessage('Could not load employees. Please ensure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '',
      birthday: '',
      address: ''
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    const employeeData = {
      name: form.name.trim(),
      birthday: form.birthday,
      address: form.address.trim()
    };

    try {
      const url = editing ? `${API_BASE}/employees/${editing.id}` : `${API_BASE}/employees/`;
      const method = editing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });

      if (!response.ok) {
        throw new Error('Could not save employee');
      }

      await fetchEmployees();
      resetForm();
      alert(editing ? 'Employee updated successfully!' : 'Employee added successfully!');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/employees/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Could not delete employee');
      }
      await fetchEmployees();
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditing(employee);
    setForm({
      name: employee.name,
      birthday: employee.birthday,
      address: employee.address
    });
    document.getElementById('employee-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <strong className="block font-semibold">Unable to load employees</strong>
          <p>{errorMessage}</p>
        </div>
      )}

      <div id="employee-form" className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {editing ? '✏️ Edit Employee' : '➕ Add New Employee'}
          </h2>
          <p className="text-gray-600">
            {editing ? 'Update the selected employee information.' : 'Add a new employee record to the database.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Employee Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, name: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nguyễn Văn A"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.name ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.name || 'Full employee name'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎂 Birthday <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, birthday: '' }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                  formErrors.birthday ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.birthday ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.birthday || 'Select the employee birth date'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏠 Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                onFocus={() => setFormErrors(prev => ({ ...prev, address: '' }))}
                className={`w-full min-h-[100px] resize-none px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${
                  formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ho Chi Minh City, District 1, 123 Nguyễn Huệ"
                required
                disabled={submitting}
              />
              <p className={`mt-1 text-sm ${formErrors.address ? 'text-red-600' : 'text-gray-500'}`}>
                {formErrors.address || 'Street, district, and city information'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (editing ? 'Updating...' : 'Adding...') : (editing ? '💾 Update Employee' : '➕ Add Employee')}
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
        </form>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">👥 Employee Directory</h2>
          <p className="text-gray-600 mt-1">View and manage employees in the database.</p>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-4">Add a new employee using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Birthday</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{employee.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{employee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.birthday}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
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

      {employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{employees.length}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{employees.filter(e => e.address).length}</div>
            <div className="text-sm text-gray-600">Employees with Address</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{new Date().getFullYear()}</div>
            <div className="text-sm text-gray-600">Current Year</div>
          </div>
        </div>
      )}
    </div>
  );
}
