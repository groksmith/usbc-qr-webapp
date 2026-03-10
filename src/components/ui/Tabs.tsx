import React from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  /** Dashboard variant: white bg, black text when active, no bottom margin (for attachment to table) */
  variant?: "default" | "dashboard";
}

export function Tabs({ tabs, activeId, onChange, variant = "default" }: TabsProps): React.ReactElement {
  const isDashboard = variant === "dashboard";
  return (
    <div className={`flex gap-0 ${isDashboard ? "mb-0" : "mb-4"}`}>
      {tabs.map((tab, index) => {
        const isActive = activeId === tab.id;
        const isFirst = index === 0;
        const isLast = index === tabs.length - 1;

        if (isDashboard) {
          const radiusTL = isActive || isFirst ? "rounded-tl-card" : "rounded-tl-none";
          const radiusTR = isActive || isLast ? "rounded-tr-card" : "rounded-tr-none";
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center px-[30px] h-[54px] text-base font-semibold border-0 cursor-pointer rounded-bl-none rounded-br-none ${radiusTL} ${radiusTR} ${
                isActive ? "bg-primary text-white" : "bg-transparent text-[#333333]"
              }`}
            >
              {tab.label}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`py-[15px] px-[30px] text-base border-0 border-b-[3px] border-solid cursor-pointer rounded-tl-[6px] rounded-tr-[6px] rounded-bl-none rounded-br-none ${
              isActive
                ? "font-semibold text-primary bg-primary/15 border-primary"
                : "font-normal text-body-text bg-transparent border-transparent"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
