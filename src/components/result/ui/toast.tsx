'use client';

type Props = { message: string };

export function Toast({ message }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[100px] z-50 flex justify-center px-6">
      <div className="rounded-full bg-[#373737] px-5 py-3 text-sm font-medium text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
