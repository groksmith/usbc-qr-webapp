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
    <div
      style={{
        display: "flex",
        gap: 0,
        marginBottom: isDashboard ? 0 : "16px",
        backgroundColor: isDashboard ? "transparent" : undefined,
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = activeId === tab.id;
        const isFirst = index === 0;
        const isLast = index === tabs.length - 1;
        const activeRadius = "12px";
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: isDashboard ? "flex" : undefined,
              alignItems: isDashboard ? "center" : undefined,
              padding: isDashboard ? "0 20px" : "10px 20px",
              height: isDashboard ? "44px" : undefined,
              fontSize: "16px",
              fontWeight: isDashboard ? 600 : (isActive ? 600 : 400),
              color: isActive ? (isDashboard ? "#FFFFFF" : "var(--color-primary)") : (isDashboard ? "#333333" : "var(--color-body)"),
              backgroundColor: isActive ? (isDashboard ? "var(--color-primary)" : "rgba(93, 159, 181, 0.15)") : "transparent",
              border: "none",
              borderBottom: isDashboard ? "none" : isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
              cursor: "pointer",
              borderRadius: isDashboard
                ? isActive
                  ? `${activeRadius} ${activeRadius} 0 0`
                  : `${isFirst ? activeRadius : 0} ${isLast ? activeRadius : 0} 0 0`
                : "6px 6px 0 0",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
