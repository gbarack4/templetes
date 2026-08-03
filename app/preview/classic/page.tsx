import { headers } from "next/headers";
import { ClassicTemplate } from "@/templates/ClassicTemplate";

async function getRealSiteConfig() {
  try {
    const headerList = await headers();
    const host = headerList.get("host") || "";
    const domain = host.split(".")[0];

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/websites/${domain}`,
      { cache: "no-store" },
    );

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ClassicTemplatePreviewPage() {
  const realData = await getRealSiteConfig();

  if (!realData) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        No real school data found for this domain.
      </div>
    );
  }

  return <ClassicTemplate data={realData} />;
}
