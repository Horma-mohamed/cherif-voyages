import { requireAdmin } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import {
  getOverviewStats,
  getBookingsList,
  getGroupsList,
  getPaymentsList,
  getCustomersList,
  getCataloguePackages
} from '@/lib/adminData';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { logoutAdminAction } from '@/lib/actions/adminAuth';

export default async function AdminPage() {
  const admin = await requireAdmin();
  const t = await getTranslations('Admin');

  const [stats, bookings, groups, payments, customers, packages] = await Promise.all([
    getOverviewStats(),
    getBookingsList(),
    getGroupsList(),
    getPaymentsList(),
    getCustomersList(),
    getCataloguePackages()
  ]);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[var(--color-divider)] px-[28px] py-2 text-[13px] text-[rgba(15,17,21,0.6)]">
        <span>{admin.name}</span>
        <form action={logoutAdminAction}>
          <button className="uline cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[var(--color-sky)]">
            {t('logout')}
          </button>
        </form>
      </div>
      <AdminDashboard stats={stats} bookings={bookings} groups={groups} payments={payments} customers={customers} packages={packages} />
    </div>
  );
}
