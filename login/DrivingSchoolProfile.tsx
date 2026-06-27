import Image from "next/image";
import type { DrivingSchoolProfile as DrivingSchoolProfileData } from "./school-profile";

type DrivingSchoolProfileProps = Readonly<{
  school: DrivingSchoolProfileData;
  className?: string;
}>;

export function DrivingSchoolProfile({ school, className = "" }: DrivingSchoolProfileProps) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 ${className}`.trim()}
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-blue-50 ring-1 ring-blue-100">
        <Image
          src={school.logoUrl}
          alt={`${school.name} logo`}
          width={32}
          height={32}
          className="h-full w-full object-cover"
        />
      </div>
      <p className="text-sm font-semibold text-slate-900">{school.name}</p>
    </div>
  );
}
