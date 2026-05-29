export function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
}) {
  return (
    <div className="mb-10 text-center sm:mb-14">
      <div className="mb-4 flex items-center justify-center gap-3 text-[#373737]/55">
        <span className="h-px w-6 bg-[#373737]/20" />
        <span className="text-[11px] font-medium tracking-[0.22em]">{eyebrow}</span>
        <span className="h-px w-6 bg-[#373737]/20" />
      </div>
      <h2 className="text-[26px] font-bold leading-tight text-[#373737] sm:text-[40px] sm:tracking-[-1px]">
        {title}
      </h2>
      {desc && (
        <p className="mx-auto mt-4 max-w-md text-sm text-[#373737]/65 sm:max-w-2xl sm:text-base">
          {desc}
        </p>
      )}
    </div>
  );
}
