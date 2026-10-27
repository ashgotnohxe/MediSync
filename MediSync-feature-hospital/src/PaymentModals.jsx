import { useState } from "react";

// Payment ke 3 tareeke
const METHODS = [
  { id: "upi", label: "📱 UPI", name: "UPI" },
  { id: "card", label: "💳 Card", name: "Card" },
  { id: "cod", label: "💵 Cash on Delivery", name: "Cash on Delivery" },
];

export default function PaymentsModal({ title, amount, onClose, onSuccess }) {
  const [method, setMethod] = useState("upi");             // chuna hua tareeka
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});                // galtiyan
  const [processing, setProcessing] = useState(false);

  const methodName = METHODS.find((m) => m.id === method).name;

  // Card ka koi box badle to state update
  function handleCardChange(e) {
    setCard({ ...card, [e.target.name]: e.target.value });
  }

  // Validation: sirf chune hue tareeke ki jaanch hoti hai
  function validate() {
    const newErrors = {};
    if (method === "upi" && !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      newErrors.upi = "Enter a valid UPI ID, e.g. neha@upi";
    }
    if (method === "card") {
      if (!/^[0-9]{16}$/.test(card.number.replace(/\s/g, ""))) {
        newErrors.number = "Card number must be 16 digits";
      }
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(card.expiry)) {
        newErrors.expiry = "Use MM/YY format";
      }
      if (!/^[0-9]{3}$/.test(card.cvv)) {
        newErrors.cvv = "CVV must be 3 digits";
      }
    }
    return newErrors;
  }

  function pay() {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; // galti hai to ruk jao

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (method === "cod") {
        alert(`✅ Order placed!\nPay ₹${amount} in cash when your order arrives.`);
      } else {
        alert(`✅ Payment Confirmed!\n₹${amount} paid via ${methodName} for "${title}".`);
      }
      onSuccess(methodName); // kis tareeke se pay kiya, wo bhi bhejo
    }, 1200);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-amount">Amount: ₹{amount}</p>

        {/* Tareeka chuno */}
        <div className="pay-methods">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={method === m.id ? "pay-method on" : "pay-method"}
              onClick={() => {
                setMethod(m.id);
                setErrors({});
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* UPI ke liye */}
        {method === "upi" && (
          <div className="pay-field">
            <label htmlFor="upi">UPI ID</label>
            <input
              id="upi"
              className={errors.upi ? "pay-input pay-input-error" : "pay-input"}
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="neha@upi"
            />
            {errors.upi && <p className="pay-error">{errors.upi}</p>}
          </div>
        )}

        {/* Card ke liye */}
        {method === "card" && (
          <>
            <div className="pay-field">
              <label htmlFor="number">Card number</label>
              <input
                id="number"
                name="number"
                maxLength={19}
                className={errors.number ? "pay-input pay-input-error" : "pay-input"}
                value={card.number}
                onChange={handleCardChange}
                placeholder="1234 5678 9012 3456"
              />
              {errors.number && <p className="pay-error">{errors.number}</p>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div className="pay-field" style={{ flex: 1 }}>
                <label htmlFor="expiry">Expiry</label>
                <input
                  id="expiry"
                  name="expiry"
                  maxLength={5}
                  className={errors.expiry ? "pay-input pay-input-error" : "pay-input"}
                  value={card.expiry}
                  onChange={handleCardChange}
                  placeholder="MM/YY"
                />
                {errors.expiry && <p className="pay-error">{errors.expiry}</p>}
              </div>
              <div className="pay-field" style={{ flex: 1 }}>
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  name="cvv"
                  type="password"
                  maxLength={3}
                  className={errors.cvv ? "pay-input pay-input-error" : "pay-input"}
                  value={card.cvv}
                  onChange={handleCardChange}
                  placeholder="123"
                />
                {errors.cvv && <p className="pay-error">{errors.cvv}</p>}
              </div>
            </div>
          </>
        )}

        {/* Cash on delivery ke liye kuch bharna nahi */}
        {method === "cod" && (
          <p className="pay-note">No payment needed now. Pay ₹{amount} in cash when the order arrives.</p>
        )}

        <button onClick={pay} disabled={processing} className="modal-pay-btn">
          {processing ? "Processing..." : method === "cod" ? "Place Order" : `Pay ₹${amount}`}
        </button>
        <button onClick={onClose} className="modal-cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}