import { ReactNode } from "react";

interface DoublePanelLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function DoublePanelLayout({ left, right }: DoublePanelLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-52px-72px)]">
      <div className="flex-1 min-w-0 p-5 md:px-6 bg-white md:border-r border-slate-200">
        {left}
      </div>
      <div className="flex-1 min-w-0 p-5 md:px-6" style={{ background: "#fafcff" }}>
        {right}
      </div>
    </div>
  );
}
