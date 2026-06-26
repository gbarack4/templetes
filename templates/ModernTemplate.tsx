import type { TemplateProps } from "./types";

export function ModernTemplate({ data }: Readonly<TemplateProps>) {
  const primaryColor = data.config?.primaryColor || "#2563eb";

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="bg-white p-6 shadow-sm border-b-4"
        style={{ borderColor: primaryColor }}
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900">
            {data.schoolName}
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Modern Design</h2>
          <p className="text-slate-600">
            {data.config?.welcomeText ||
              "Welcome to our driving school! This is the modern template."}
          </p>
        </div>
      </main>
    </div>
  );
}
