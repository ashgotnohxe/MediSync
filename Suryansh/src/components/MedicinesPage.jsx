import { useState, useEffect } from "react";
import PaymentModal from "./PaymentModal";
import DeliveryCountdown from "./DeliveryCountdown";

const MEDICINES = [
  { id: 1, name: "Paracetamol 500mg", price: 25, category: "Fever", tags: ["fever", "pain", "headache"] },
  { id: 2, name: "ORS Electrolyte Sachets", price: 20, category: "Dehydration", tags: ["dehydration", "diarrhea", "vomit", "weakness"] },
  { id: 3, name: "Cetirizine 10mg", price: 30, category: "Allergy", tags: ["allergy", "itching", "cold", "sneeze"] },
  { id: 4, name: "Antiseptic Spray", price: 85, category: "First Aid", tags: ["cut", "wound", "injury", "blood"] },
  { id: 5, name: "Cough Syrup Herbal", price: 65, category: "Cold & Cough", tags: ["cough", "cold", "throat", "mucus"] },
  { id: 6, name: "Digital Thermometer", price: 150, category: "First Aid", tags: ["fever", "temperature", "check"] },
  { id: 7, name: "Ibuprofen 400mg", price: 35, category: "Pain Relief", tags: ["pain", "fever", "body ache", "joint"] },
  { id: 8, name: "Antacid Tablets", price: 40, category: "Digestion", tags: ["acidity", "stomach ache", "gas", "heartburn"] },
  { id: 9, name: "Multivitamin Immunity", price: 120, category: "Vitamins", tags: ["weakness", "fatigue", "energy"] },
  { id: 10, name: "Vitamin C Chewable", price: 90, category: "Vitamins", tags: ["immunity", "cold", "skin"] },
  { id: 11, name: "Band-Aid Pack (10x)", price: 45, category: "First Aid", tags: ["cut", "wound", "scrape"] },
  { id: 12, name: "Crepe Bandage", price: 55, category: "First Aid", tags: ["sprain", "injury", "swelling"] },
];

function MedCard({ med, qty, onAdd, onRemove }) {
  return (
    <div className="med-card">
      <div className="med-card-cat">{med.category}</div>
      <div className="med-card-name">{med.name}</div>
      <div className="med-card-price">₹{med.price}</div>

      <div className="med-card-action">
        {qty === 0 ? (
          <button onClick={() => onAdd(med.id)} className="med-add-btn">
            + Add
          </button>
        ) : (
          <div className="med-qty-row">
            <button onClick={() => onRemove(med.id)} className="med-qty-btn">
              −
            </button>
            <span className="med-qty-val">{qty}</span>
            <button onClick={() => onAdd(med.id)} className="med-qty-btn">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MedicinesPage({ username }) {
  const [symptom, setSymptom] = useState("");
  const [suggested, setSuggested] = useState([]);
  const [cart, setCart] = useState({});
  const [showPay, setShowPay] = useState(false);
  const [orders, setOrders] = useState([]);

/// ==== new add 
  const [search, setSearch] = useState("");      // naam se search
const [category, setCategory] = useState("All"); // category filter
const [sort, setSort] = useState("none");      // price sort



/// new add == 
  useEffect(() => {
    loadOrders();
  }, [username]);

  function loadOrders() {
    try {
      const o = localStorage.getItem(`medorders_${username}`);
      setOrders(o ? JSON.parse(o) : []);
    } catch (e) {
      console.error(e);
    }
  }

  function suggest() {
    const q = symptom.trim().toLowerCase();
    if (!q) {
      setSuggested([]);
      return;
    }
    setSuggested(
      MEDICINES.filter((m) =>
        m.tags.some((t) => q.includes(t) || t.includes(q))
      )
    );
  }

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  function removeFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  }

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const med = MEDICINES.find((m) => m.id === Number(id));
    return sum + (med ? med.price * qty : 0);
  }, 0);

  function onPaySuccess() {
    const items = Object.entries(cart).map(([id, qty]) => {
      const med = MEDICINES.find((m) => m.id === Number(id));
      return { id: med.id, name: med.name, price: med.price, qty };
    });
    const order = { items, total, placedAt: Date.now() };
    const newOrders = [order, ...orders];
    localStorage.setItem(`medorders_${username}`, JSON.stringify(newOrders));
    setOrders(newOrders);
    setCart({});
    setShowPay(false);
  }


// --- new add  === 

  // Category dropdown ke options (MEDICINES se apne aap bante hain)
const categories = ["All", ...new Set(MEDICINES.map((m) => m.category))];

// Step 1: naam aur category se filter
let list = MEDICINES.filter(
  (m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || m.category === category)
);

// Step 2: price se sort
if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);


// --- new add  === 

  return (
    <div className="med-page">
      <h2 className="med-title">Medicine Store & Fast Pharmacy</h2>
      <p className="med-subtitle">
        Tell us your symptoms for instant recommendations · 🚚 5-minute express home delivery
      </p>

      <div className="med-search-row">
        <input
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && suggest()}
          placeholder="Type symptoms e.g. fever, headache, cold, stomach pain..."
          className="med-search-input"
        />
        <button onClick={suggest} className="med-search-btn">
          Suggest Medicines
        </button>
      </div>

      {suggested.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <h3 className="med-section-title">✨ Recommended for Your Symptoms</h3>
          <div className="med-grid">
            {suggested.map((m) => (
              <MedCard
                key={m.id}
                med={m}
                qty={cart[m.id] || 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        </div>
      )}

      {/* <h3 className="med-section-title">All Available Medicines ({MEDICINES.length})</h3>
      <div className="med-grid">
        {MEDICINES.map((m) => (
          <MedCard
            key={m.id}
            med={m}
            qty={cart[m.id] || 0}
            onAdd={addToCart}
            onRemove={removeFromCart}
          />
        ))}
      </div> */}


      {/* new add ======= */}

      <h3 className="med-section-title">All Available Medicines ({list.length})</h3>

<div className="med-search-row">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by name..."
    className="med-search-input"
  />

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="med-filter-select"
  >
    {categories.map((c) => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>

  <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="med-filter-select"
  >
    <option value="none">Sort: default</option>
    <option value="low">Price: low to high</option>
    <option value="high">Price: high to low</option>
  </select>
</div>

{list.length === 0 && <p style={{ color: "#64748b" }}>No medicines found.</p>}

<div className="med-grid">
  {list.map((m) => (
    <MedCard
      key={m.id}
      med={m}
      qty={cart[m.id] || 0}
      onAdd={addToCart}
      onRemove={removeFromCart}
    />
  ))}
</div>

{/* // --- new add ----- // */}

      {total > 0 && (
        <div className="med-cart-bar">
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>
              Cart Total: ₹{total}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              {Object.values(cart).reduce((a, b) => a + b, 0)} item(s) in cart
            </div>
          </div>
          <button onClick={() => setShowPay(true)} className="med-checkout-btn">
            Proceed to Checkout (₹{total}) →
          </button>
        </div>
      )}

      {orders.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3 className="med-section-title">📦 Your Recent Orders</h3>
          <div className="med-orders-list">
            {orders.map((o, i) => (
              <div key={i} className="med-order-card">
                <div className="med-order-top">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>
                      Order #{orders.length - i} · ₹{o.total}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {o.items?.map((item) => `${item.name} (x${item.qty})`).join(", ")}
                    </div>
                  </div>
                  <DeliveryCountdown placedAt={o.placedAt} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPay && (
        <PaymentModal
          title="Medicine Order Checkout"
          amount={total}
          onClose={() => setShowPay(false)}
          onSuccess={onPaySuccess}
        />
      )}
    </div>
  );
}
