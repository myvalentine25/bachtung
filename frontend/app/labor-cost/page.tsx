import Link from 'next/link';
import LaborCostManager from './LaborCostManager';

export default function LaborCostPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Labor Cost Management</h1>
          <p className="text-gray-600">Manage employee work outputs and track daily production.</p>
        </div>
        <Link
          href="/labor-cost/summary"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          📊 View Summary
        </Link>
      </div>
      <LaborCostManager />
    </div>
  );
}