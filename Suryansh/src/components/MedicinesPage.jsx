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
          <button
            type="button"
            onClick={() => onAdd(med.id)}
            className="med-add-btn"
          >
            + Add to Cart
          </button>
        ) : (
          <div className="med-qty-row">
            <button
              type="button"
              onClick={() => onRemove(med.id)}
              className="med-qty-btn"
              aria-label={`Remove one ${med.name}`}
            >
              −
            </button>
            <span className="med-qty-val">{qty}</span>
            <button
              type="button"
              onClick={() => onAdd(med.id)}
              className="med-qty-btn"
              aria-label={`Add one ${med.name}`}
            >
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("none");

  useEffect(() => {
    loadOrders();
  }, [username]);

  function loadOrders() {
    try {
      const saved = localStorage.getItem(`medorders_${username}`);
      setOrders(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Could not load orders:", e);
      setOrders([]);
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
        m.tags.some((tag) => q.includes(tag) || tag.includes(q))
      )
    );
  }

  function addToCart(id) {
    setCart((current) => ({
      ...current,
      [id]: (current[id] || 0) + 1,
    }));
  }

  function removeFromCart(id) {
    setCart((current) => {
      const next = { ...current };

      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }

      return next;
    });
  }

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const med = MEDICINES.find((item) => item.id === Number(id));
      return med ? { ...med, qty } : null;
    })
    .filter(Boolean);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  function onPaySuccess() {
    const items = cartItems.map(({ id, name, price, qty }) => ({
      id,
      name,
      price,
      qty,
    }));

    const order = {
      id: Date.now(),
      items,
      total,
      placedAt: Date.now(),
      status: "Confirmed",
    };

    const newOrders = [order, ...orders];

    try {
      localStorage.setItem(
        `medorders_${username}`,
        JSON.stringify(newOrders)
      );

      setOrders(newOrders);
      setCart({});
      setShowPay(false);
    } catch (e) {
      console.error("Could not save order:", e);
      alert("Order could not be saved. Please try again.");
    }
  }

  const categories = [
    "All",
    ...new Set(MEDICINES.map((med) => med.category)),
  ];

  let list = MEDICINES.filter(
    (med) =>
      med.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || med.category === category)
  );

  if (sort === "low") {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    list = [...list].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="med-page">
      <h2 className="med-title">Medicine Store & Fast Pharmacy</h2>

      <p className="med-subtitle">
        Tell us your symptoms for instant recommendations ·
        🚚 5-minute express home delivery
      </p>

      <div className="med-search-row">
        <input
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && suggest()}
          placeholder="Enter symptoms e.g. fever, headache, cold..."
          className="med-search-input"
        />
        <button onClick={suggest} className="med-search-btn">
          Suggest Medicines
        </button>
      </div>

      {suggested.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 className="med-section-title">
            ✨ Recommended for Your Symptoms
          </h3>

          <div className="med-grid">
            {suggested.map((med) => (
              <MedCard
                key={med.id}
                med={med}
                qty={cart[med.id] || 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        </div>
      )}

      <h3 className="med-section-title">
        All Available Medicines ({list.length})
      </h3>

      <div className="med-search-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by medicine name..."
          className="med-search-input"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="med-filter-select"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
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

      {list.length === 0 && (
        <p style={{ color: "#64748b" }}>No medicines found.</p>
      )}

      <div className="med-grid">
        {list.map((med) => (
          <MedCard
            key={med.id}
            med={med}
            qty={cart[med.id] || 0}
            onAdd={addToCart}
            onRemove={removeFromCart}
          />
        ))}
      </div>

      {/* Cart */}
      <div className="med-cart-panel">
        <h3 className="med-section-title">
          🛒 Your Cart ({totalItems} items)
        </h3>

        {cartItems.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            Your cart is empty. Add medicines to get started.
          </p>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="med-cart-item"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  padding: "12px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ color: "#64748b", fontSize: 13 }}>
                    ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
                  </div>
                </div>

                <div className="med-qty-row">
                  <button
                    type="button"
                    className="med-qty-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    −
                  </button>
                  <span className="med-qty-val">{item.qty}</span>
                  <button
                    type="button"
                    className="med-qty-btn"
                    onClick={() => addToCart(item.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <strong style={{ fontSize: 20 }}>
                Total: ₹{total}
              </strong>

              <button
                type="button"
                onClick={() => setShowPay(true)}
                className="med-checkout-btn"
              >
                Proceed to Payment · ₹{total} →
              </button>
            </div>
          </>
        )}
      </div>

      {orders.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3 className="med-section-title">
            📦 Your Recent Orders
          </h3>

          <div className="med-orders-list">
            {orders.map((order, index) => (
              <div key={order.id || index} className="med-order-card">
                <div className="med-order-top">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      Order #{orders.length - index} · ₹{order.total}
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {order.items
                        ?.map((item) => `${item.name} (x${item.qty})`)
                        .join(", ")}
                    </div>

                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      Status: {order.status || "Confirmed"}
                    </div>
                  </div>

                  <DeliveryCountdown placedAt={order.placedAt} />
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






