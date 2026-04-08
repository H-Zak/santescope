import { ReactNode } from "react";

interface DoublePanelLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function DoublePanelLayout({ left, right }: DoublePanelLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 px-8 py-6">
      <div className="flex-1 min-w-0">{left}</div>
      <div className="flex-1 min-w-0">{right}</div>
    </div>
  );
}
