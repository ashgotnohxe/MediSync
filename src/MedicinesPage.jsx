import { useState, useEffect } from "react";
import PaymentModal from "./PaymentModal";
import DeliveryCountdown from "./DeliveryCountdown";

const MEDICINES = [
  { id: 1, name: "Paracetamol 500mg", price: 25, category: "Fever", tags: ["fever","pain","headache"] },
  { id: 2, name: "ORS Sachets", price: 20, category: "Dehydration", tags: ["dehydration","diarrhea"] },
  { id: 3, name: "Cetirizine 10mg", price: 30, category: "Allergy", tags: ["allergy","itching","cold"] },
  { id: 4, name: "Antiseptic Spray", price: 85, category: "First Aid", tags: ["cut","wound","injury"] },
  { id: 5, name: "Cough Syrup", price: 65, category: "Cold & Cough", tags: ["cough","cold","throat"] },
  { id: 6, name: "Digital Thermometer", price: 150, category: "First Aid", tags: ["fever","temperature"] },
  { id: 7, name: "Ibuprofen 400mg", price: 35, category: "Pain Relief", tags: ["pain","fever","body ache"] },
  { id: 8, name: "Antacid Tablets", price: 40, category: "Digestion", tags: ["acidity","stomach ache"] },
  { id: 9, name: "Multivitamin Tablets", price: 120, category: "Vitamins", tags: ["weakness","fatigue"] },
  { id: 10, name: "Vitamin C Tablets", price: 90, category: "Vitamins", tags: ["immunity","cold"] },
  { id: 11, name: "Band-Aid Pack", price: 45, category: "First Aid", tags: ["cut","wound"] },
  { id: 12, name: "Crepe Bandage", price: 55, category: "First Aid", tags: ["sprain","injury"] },
];

export default function MedicinesPage({ username }) {
  const [symptom, setSymptom] = useState("");
  const [suggested, setSuggested] = useState([]);
  const [cart, setCart] = useState({});
  const [showPay, setShowPay] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => { loadOrders(); }, []);

  function loadOrders() {
    const o = localStorage.getItem(`medorders_${username}`);
    setOrders(o ? JSON.parse(o) : []);
  }

  function suggest() {
    const q = symptom.trim().toLowerCase();
    if (!q) { setSuggested([]); return; }
    setSuggested(MEDICINES.filter((m) => m.tags.some((t) => q.includes(t) || t.includes(q))));
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
    const newOrders = [...orders, order];
    localStorage.setItem(`medorders_${username}`, JSON.stringify(newOrders));
    setOrders(newOrders);
    setCart({});
    setShowPay(false);
  }

  return (
    <div className="med-page">
      <h2 className="med-title">Medicine Store</h2>
      <p className="med-subtitle">Tell us your symptoms and we'll suggest medicines · 5 minute home delivery</p>

      <div className="med-search-row">
        <input
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="e.g. fever, cough, stomach ache..."
          className="med-search-input"
        />
        <button onClick={suggest} className="med-search-btn">Suggest</button>
      </div>

      {suggested.length > 0 && (
        <div>
          <h3 className="med-section-title">Suggested for you</h3>
          <div className="med-grid">
            {suggested.map((m) => (
              <MedCard key={m.id} med={m} qty={cart[m.id] || 0} onAdd={addToCart} onRemove={removeFromCart} />
            ))}
          </div>
        </div>
      )}

      <h3 className="med-section-title">All medicines ({MEDICINES.length})</h3>
      <div className="med-grid">
        {MEDICINES.map((m) => (
          <MedCard key={m.id} med={m} qty={cart[m.id] || 0} onAdd={addToCart} onRemove={removeFromCart} />
        ))}
      </div>

      {total > 0 && (
        <div className="med-checkout-bar">
          <span style={{ fontWeight: 600 }}>Total: ₹{total}</span>
          <button onClick={() => setShowPay(true)} className="med-checkout-btn">Payment</button>
        </div>
      )}

      {showPay && (
        <PaymentModal
          title="Medicine Order"
          amount={total}
          onClose={() => setShowPay(false)}
          onSuccess={onPaySuccess}
        />
      )}

      {orders.length > 0 && (
        <div className="med-orders">
          <h3 className="med-section-title">Your orders</h3>
          {orders.map((o, i) => (
            <div key={i} className="med-order-row">
              <span>{o.items.length} items · ₹{o.total}</span>
              <DeliveryCountdown placedAt={o.placedAt} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MedCard({ med, qty, onAdd, onRemove }) {
  return (
    <div className="med-card">
      <span className="med-tag">{med.category}</span>
      <h4 className="med-name">{med.name}</h4>
      <div className="med-bottom-row">
        <span className="med-price">₹{med.price}</span>
        {qty === 0 ? (
          <button onClick={() => onAdd(med.id)} className="med-add-btn">Add</button>
        ) : (
          <div className="med-qty-row">
            <button onClick={() => onRemove(med.id)} className="med-qty-btn">-</button>
            <span>{qty}</span>
            <button onClick={() => onAdd(med.id)} className="med-qty-btn">+</button>
          </div>
        )}
      </div>
    </div>
  );
}