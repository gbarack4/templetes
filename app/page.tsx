export default function Home() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";
  const protocol = baseDomain.includes("localhost") ? "http" : "https";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          DrivingInstructor.pro Sites Engine
        </h1>
        <p className="text-slate-600 mb-8">
          This service automatically generates and hosts public websites for
          driving schools.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 text-left">
          <p className="font-semibold text-slate-700 mb-2">How to test:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Go to{" "}
              <a
                href={`${protocol}://demo.${baseDomain}`}
                className="text-blue-600 hover:underline"
              >
                demo.{baseDomain}
              </a>{" "}
              to view a demo school site.
            </li>
            <li>
              Go to{" "}
              <a
                href={`${protocol}://classic.${baseDomain}`}
                className="text-blue-600 hover:underline"
              >
                classic.{baseDomain}
              </a>{" "}
              for another test.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
