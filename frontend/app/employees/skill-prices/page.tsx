import SkillPriceManager from './SkillPriceManager';

export default function EmployeeSkillPricesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Skill Price Management</h1>
          <p className="text-gray-600">View, add, update, and delete employee skill pricing records.</p>
        </div>
      </div>
      <SkillPriceManager />
    </div>
  );
}
