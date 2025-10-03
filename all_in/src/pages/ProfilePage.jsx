import UserProfile from '../components/allergyfinder/UserProfile'

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-500/10 to-brand-600/10 px-8 py-10 text-slate-900 shadow-lg dark:border-brand-500/30 dark:from-brand-500/20 dark:to-brand-700/20 dark:text-slate-100">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-slate-900/60 dark:text-brand-200">
            Profile
          </span>
          <h1 className="text-3xl font-semibold sm:text-4xl">User Preferences & Stats</h1>
          <p className="max-w-2xl text-sm text-slate-700 dark:text-slate-300">
            Manage your generated alias, review chat counters across experiences, and clear local cookies for allergy notes and
            saved conversations. Everything shown here lives only in your browser.
          </p>
        </div>
      </section>

      <UserProfile />
    </div>
  )
}
