import { useState } from "react";

export default function PaymentModal({ title, amount, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  function pay() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert(`✅ Payment Confirmed!\n₹${amount} paid successfully for "${title}".`);
      onSuccess();
    }, 1200);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-amount">Amount: ₹{amount}</p>
        <button onClick={pay} disabled={processing} className="modal-pay-btn">
          {processing ? "Processing..." : `Pay ₹${amount}`}
        </button>
        <button onClick={onClose} className="modal-cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}
