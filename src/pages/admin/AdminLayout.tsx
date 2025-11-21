import { ReactNode } from 'react';
import { LayoutDashboard, UtensilsCrossed, LogOut, Menu as MenuIcon, ShoppingBag } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
          isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-700 hover:bg-slate-100'
        }`
      }
      end
    >
      <span className="flex items-center gap-3">
        <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </span>
      <span className="text-slate-400">
        <MenuIcon className="w-4 h-4" />
      </span>
    </NavLink>
  );
}

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-800" dir="rtl">
      <div className="grid lg:grid-cols-[280px_1fr] min-h-screen">
        <aside className="bg-white/95 backdrop-blur border-l border-slate-200 shadow-xl">
          <div className="px-6 py-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                QR
              </div>
              <div>
                <p className="text-sm text-slate-500">لوحة التحكم</p>
                <p className="text-lg font-bold text-slate-900">إدارة المطعم</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-orange-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

      <nav className="p-4 space-y-2">
        <SidebarLink
          to="/dashboard"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="الرئيسية"
        />
        <SidebarLink
          to="/dashboard"
          icon={<UtensilsCrossed className="w-5 h-5" />}
          label="بيانات المطعم"
        />
        <SidebarLink
          to="/dashboard"
          icon={<UtensilsCrossed className="w-5 h-5" />}
          label="القائمة"
        />
        <SidebarLink
          to="/dashboard"
          icon={<ShoppingBag className="w-5 h-5" />}
          label="الطلبات"
        />
      </nav>
        </aside>

        <main className="p-4 sm:p-6">
          <header className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-xl font-bold text-slate-900">لوحة تحكم الإدارة</h1>
            </div>
            <Link
              to="/dashboard"
              className="text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center gap-2"
            >
              العودة إلى لوحة المطعم
            </Link>
          </header>

          <div className="space-y-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
