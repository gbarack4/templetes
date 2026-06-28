import Link from "next/link";
import type { TemplateProps } from "./types";

export function ClassicTemplate({ data }: Readonly<TemplateProps>) {
  const primaryColor = data.config?.primaryColor || "#0f172a";

  return (
    <div className="min-h-screen bg-white">
      <header className="py-10 px-6" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <h1 className="text-4xl font-serif text-white text-center sm:text-left">
            {data.schoolName}
          </h1>

          <Link
            href="/login"
            className="px-6 py-2 bg-white text-slate-900 font-serif font-medium rounded shadow hover:bg-slate-100 transition-colors"
          >
            Student Login
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-8 mt-4 text-center">
        <h2 className="text-2xl font-serif mb-4 border-b pb-4">
          Classic Design
        </h2>
        <p className="text-lg leading-relaxed text-slate-700">
          {data.config?.welcomeText ||
            "Learn to drive with the best. This is the classic template."}
        </p>
      </main>
    </div>
  );
}
