// ==========================================================
// VIVA TOPIC: Lifting State Up
// - State lives in the PARENT component
// - CHILD receives 'activeTab' and 'onTabChange' via PROPS
// - When a tab is clicked, child calls 'onTabChange(tab)'
// - This updates the parent's state!
// ==========================================================

export default function FilterTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "10px 0" }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: activeTab === tab ? "2px solid #0f172a" : "1.5px solid #cbd5e1",
            background: activeTab === tab ? "#0f172a" : "#ffffff",
            color: activeTab === tab ? "#ffffff" : "#334155",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "12px"
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
