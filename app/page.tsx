export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="max-w-2xl bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          DrivingInstructor.pro
        </h1>
        <p className="text-slate-600 mb-8 text-lg">
          The core engine for generating and hosting dynamic driving school
          websites.
        </p>

        <div className="bg-slate-50 p-8 rounded-2xl text-sm text-slate-700 text-left border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 border-b pb-2">
            Platform Architecture Overview
          </h2>

          <ul className="space-y-5">
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0">
                1
              </div>
              <div>
                <strong className="block text-slate-900 text-base">
                  Multi-tenant Routing
                </strong>
                <span className="text-slate-500 mt-1 block">
                  Each school operates within its own isolated space via a
                  dedicated subdomain or custom domain. The Next.js middleware
                  automatically detects the school prefix from the URL.
                </span>
              </div>
            </li>

            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0">
                2
              </div>
              <div>
                <strong className="block text-slate-900 text-base">
                  Dynamic Templates
                </strong>
                <span className="text-slate-500 mt-1 block">
                  Public websites are rendered server-side based on the active
                  domain, applying the specific school&apos;s configuration,
                  theme, and data from the database.
                </span>
              </div>
            </li>

            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0">
                3
              </div>
              <div>
                <strong className="block text-slate-900 text-base">
                  Unified Student Portal
                </strong>
                <span className="text-slate-500 mt-1 block">
                  Application routes like{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded border text-slate-800">
                    /login
                  </code>{" "}
                  and{" "}
                  <code className="bg-white px-1.5 py-0.5 rounded border text-slate-800">
                    /dashboard
                  </code>{" "}
                  are shared globally across all templates but dynamically
                  isolate student data depending on the current school&apos;s
                  domain.
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
