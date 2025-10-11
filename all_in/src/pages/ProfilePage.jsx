import UserProfile from '../components/allergyfinder/UserProfile'

export default function ProfilePage() {
  return (
    <div className="space-y-10">
      <header className="rounded-4xl border border-slate-200 bg-white py-10 pl-10 pr-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100 dark:bg-slate-800 dark:text-slate-200">
              Dashboard
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">Profile Control Center</h1>
              <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
                Review your generated alias, local activity, and saved preferences. You own the data on this page—every action
                here updates information stored only in your browser.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 px-6 py-4 text-left text-sm text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Privacy Snapshot</p>
            <ul className="mt-2 space-y-1">
              <li>• No cloud sync or external storage.</li>
              <li>• Cookies stay on this device.</li>
              <li>• Reset tools clear data instantly.</li>
            </ul>
          </div>
        </div>
      </header>

      <UserProfile />
    </div>
  )
}
