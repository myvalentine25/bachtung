'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bachtung-production.up.railway.app';

interface LaborCostSummaryRecord {
  employee_id: number;
  employee_name: string;
  month: string;
  total_cost: number;
}

interface SalaryForecastRow {
  employee_id?: number;
  employee?: string;
  avg_daily_salary?: number;
  forecast_month_salary?: number;
}

export default function LaborCostSummary() {
  // AI Salary Forecast State
  const [forecast, setForecast] = useState<SalaryForecastRow[] | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [forecastUnavailable, setForecastUnavailable] = useState(false);
  const [summaryData, setSummaryData] = useState<LaborCostSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [employees, setEmployees] = useState<Array<{ id: number; name: string }>>([]);
  // Filter state for month
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSummary(), fetchEmployees()]);
      fetchForecast();
    };
    loadData();
    // Fetch AI salary forecast for all employees
    const fetchForecast = async () => {
      setForecastLoading(true);
      setForecastError('');
      setForecastUnavailable(false);
      try {
        const response = await fetch(`${API_BASE}/api/ai/salary-forecast/all`);
        if (response.status === 404) {
          setForecast([]);
          setForecastUnavailable(true);
          return;
        }
        if (!response.ok) throw new Error('Unable to fetch salary forecast');
        const data = await response.json();
        setForecast(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setForecastError('Could not load salary forecast right now.');
        setForecast(null);
      } finally {
        setForecastLoading(false);
      }
    };
  }, []);

  const fetchSummary = async () => {
    setErrorMessage('');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/labor-cost-summary/`);
      if (!response.ok) {
        throw new Error(`Unable to load summary (${response.status})`);
      }
      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setErrorMessage('Could not load labor cost summary. Please ensure the backend is reachable.');
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

  const filteredData = summaryData.filter(record => {
    if (selectedEmployee !== 'all' && record.employee_id.toString() !== selectedEmployee) {
      return false;
    }
    if (selectedMonth !== 'all' && record.month !== selectedMonth) {
      return false;
    }
    return true;
  });

  const getUniqueMonths = () => {
    const months = new Set(summaryData.map(record => record.month));
    return Array.from(months).sort().reverse();
  };

  const getUniquEmployees = () => {
    const emps = new Map();
    summaryData.forEach(record => {
      if (!emps.has(record.employee_id)) {
        emps.set(record.employee_id, record.employee_name);
      }
    });
    return Array.from(emps.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  };

  const getTotalCostForEmployee = (employeeId: number) => {
    return summaryData
      .filter(record => record.employee_id === employeeId)
      .reduce((sum, record) => sum + record.total_cost, 0);
  };

  const getTotalCostForMonth = (month: string) => {
    return summaryData
      .filter(record => record.month === month)
      .reduce((sum, record) => sum + record.total_cost, 0);
  };

  const getGrandTotal = () => {
    return summaryData.reduce((sum, record) => sum + record.total_cost, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading labor cost summary...</p>
        </div>
      </div>
    );
  }

  const uniqueMonths = getUniqueMonths();
  const uniqueEmployees = getUniquEmployees();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filter Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">📊 Labor Cost Summary</h2>
          <p className="text-gray-600 mt-1">View total labor costs by employee and month</p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Filter by Employee:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="all">All Employees</option>
              {uniqueEmployees.map(([empId, empName]) => (
                <option key={empId} value={empId.toString()}>
                  {empName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Filter by Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="all">All Months</option>
              {uniqueMonths.map((month) => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {filteredData.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 font-medium">Total Records</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{filteredData.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 font-medium">Total Cost</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${filteredData.reduce((sum, r) => sum + r.total_cost, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600 font-medium">Average Monthly Cost</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                ${(filteredData.reduce((sum, r) => sum + r.total_cost, 0) / (new Set(filteredData.map(r => r.month)).size || 1)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Labor Cost Forecast for All Employees Block */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Total Labor Cost Forecast (All Employees)</h3>
        {forecastLoading ? (
          <div className="text-gray-600">Loading forecast...</div>
        ) : forecastUnavailable ? (
          <div className="text-amber-700">Salary forecast is not available in the current backend deployment.</div>
        ) : forecastError ? (
          <div className="text-red-600">{forecastError}</div>
        ) : forecast && forecast.length > 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-green-700 mb-2">
              ${forecast.reduce((sum, row) => sum + (row.forecast_month_salary || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className="text-gray-700 text-lg">Forecasted total salary for all employees this month</div>
          </div>
        ) : (
          <div className="text-gray-600">No forecast data available.</div>
        )}
      </div>
      {/* Labor Cost Forecast Block */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Labor Cost Forecast (AI)</h3>
        {forecastLoading ? (
          <div className="text-gray-600">Loading forecast...</div>
        ) : forecastUnavailable ? (
          <div className="text-amber-700">Salary forecast is not available in the current backend deployment.</div>
        ) : forecastError ? (
          <div className="text-red-600">{forecastError}</div>
        ) : forecast && forecast.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Daily Salary</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Forecast Month Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {forecast.map((row, idx) => (
                  <tr key={row.employee_id || row.employee || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.employee}</td>
                    <td className="px-6 py-4 text-sm text-right text-blue-700">${row.avg_daily_salary?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-700">${row.forecast_month_salary?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-600">No forecast data available.</div>
        )}
      </div>
      {errorMessage && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <strong className="block font-semibold">Unable to load records</strong>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Labor Cost Breakdown</h3>
        </div>
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-600">No labor cost data available for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((record, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {record.employee_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.month + '-01').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                      ${record.total_cost.toFixed(2)}
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
