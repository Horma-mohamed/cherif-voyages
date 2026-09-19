import { requireCustomer } from '@/lib/auth';
import { getAccountData } from '@/lib/accountData';
import { getTranslations } from 'next-intl/server';
import AccountDashboard from '@/components/account/AccountDashboard';
import { logoutCustomerAction } from '@/lib/actions/customerAuth';

export default async function AccountPage() {
  const customer = await requireCustomer();
  const data = await getAccountData(customer.id);
  const t = await getTranslations('Auth');

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[var(--color-divider)] px-[28px] py-2 text-[13px] text-[rgba(15,17,21,0.6)]">
        <span>
          {customer.firstName} {customer.lastName}
        </span>
        <form action={logoutCustomerAction}>
          <button className="uline cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[var(--color-sky)]">
            {t('logout')}
          </button>
        </form>
      </div>
      <AccountDashboard data={data} />
    </div>
  );
}
