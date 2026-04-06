import Link from 'next/link';
import LaborCostSummary from '../LaborCostSummary';

export default function LaborCostSummaryPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Labor Cost Summary</h1>
          <p className="text-gray-600">View detailed labor cost breakdown by employee and month.</p>
        </div>
        <Link
          href="/labor-cost"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          ← Back to Labor Cost Management
        </Link>
      </div>
      <LaborCostSummary />
    </div>
  );
}
