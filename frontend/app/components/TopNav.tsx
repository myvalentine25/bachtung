"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();
  const isLaborCostPage = pathname?.startsWith('/labor-cost');
  const isEmployeePage = pathname?.startsWith('/employees');
  const isProductPage = pathname === '/' || pathname?.startsWith('/products');

  const navButtonClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${
      active
        ? 'border-slate-900 bg-slate-900 text-white'
        : 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200'
    }`;

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-slate-900">Bachtung ERP</span>
          <nav className="flex flex-wrap gap-2">
            <Link href="/" className={navButtonClass(isProductPage)}>
              Product Management
            </Link>
            <Link href="/employees" className={navButtonClass(isEmployeePage)}>
              Employee Management
            </Link>
            <Link href="/labor-cost" className={navButtonClass(isLaborCostPage)}>
              Labor Cost
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
