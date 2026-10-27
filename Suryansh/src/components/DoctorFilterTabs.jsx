// ==========================================================
// VIVA TOPIC: Lifting State Up
// - State lives in the PARENT (AppointmentsPage or DoctorsPage)
// - CHILD receives 'activeCategory' and 'onSelectCategory' via PROPS
// - When a tab is clicked, child calls 'onSelectCategory(cat)'
// - This updates the parent's state!
// ==========================================================

export default function DoctorFilterTabs({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="filter-tabs-container">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelectCategory(cat)}
          className={`filter-tab-btn ${activeCategory === cat ? "active" : ""}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
