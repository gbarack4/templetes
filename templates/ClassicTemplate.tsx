import type { TemplateProps } from "./types";

export function ClassicTemplate({ data }: Readonly<TemplateProps>) {
  const primaryColor = data.config?.primaryColor || "#0f172a";

  return (
    <div className="min-h-screen bg-white">
      <header
        className="py-12 text-center"
        style={{ backgroundColor: primaryColor }}
      >
        <h1 className="text-4xl font-serif text-white">{data.schoolName}</h1>
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
