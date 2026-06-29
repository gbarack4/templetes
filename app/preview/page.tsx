const TEMPLATES = [
  {
    id: "classic",
    name: "Classic Drive",
    description: "Стандартний, перевірений часом дизайн.",
    color: "bg-blue-500",
  },
  {
    id: "modern",
    name: "Modern Fast",
    description: "Сучасний стиль із яскравими акцентами.",
    color: "bg-emerald-500",
  },
  {
    id: "premium",
    name: "Premium Dark",
    description: "Темна тема для преміум-сегменту.",
    color: "bg-slate-900",
  },
];

export default function PreviewPage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 scrollbar-hide">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Choose a Theme</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a template for your driving school website.
        </p>
      </header>

      <div className="flex flex-col gap-5 pb-8">
        {TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
          >
            <div
              className={`mb-4 h-36 w-full rounded-xl ${tpl.color} opacity-90 transition-opacity group-hover:opacity-100`}
            />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {tpl.name}
                </h2>
                <p className="text-xs text-slate-500">{tpl.description}</p>
              </div>
            </div>

            <button className="mt-4 w-full rounded-lg bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
              Preview Theme
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
