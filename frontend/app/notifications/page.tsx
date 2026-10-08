import { notificationItems } from "@/components/mock-data";
import { RolePortalHeader } from "@/components/role-portal-header";

export default function NotificationsPage() {
  return (
    <>
      <RolePortalHeader />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Notifications</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Updates and alerts</h1>
        </div>

        <div className="space-y-4">
          {notificationItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {item.type}
                </span>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
