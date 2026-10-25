import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { DOCTORS } from "../mock-storage";
import PaymentModal from "./PaymentModal";

const specialties = [
  "General Physician",
  "Cardiologist",
  "Pediatrician",
  "Dermatologist",
  "Orthopedic",
  "Gynecologist",
  "ENT Specialist",
  "Neurologist",
];

// Consistent standardized doctor list shared with AppointmentsPage and DoctorDetailsPage
const doctorList = DOCTORS;

const medicineByCategory = {
  fever: {
    name: "Paracetamol 500mg",
    description: "Reduces fever and body pain. Take one tablet twice a day after food.",
    price: 40,
  },
  cold: {
    name: "Cetirizine 10mg",
    description: "Relieves runny nose and sneezing. Take one tablet at night.",
    price: 35,
  },
  cough: {
    name: "Cough Syrup",
    description: "Soothes the throat and reduces cough. Take 10ml three times a day.",
    price: 65,
  },
  cancer: {
    name: "Specialist visit required",
    description: "Please visit an oncologist in-person for clinical evaluation.",
    price: 0,
  },
  general: {
    name: "Multivitamin Tablets",
    description: "Supports general recovery and immunity. Take one tablet daily.",
    price: 90,
  },
};

function getDoctorReply(userText, replyNumber) {
  const text = userText.toLowerCase();
  let category = "general";
  let replies = [
    "I understand your concern. Please tell me more about how long you've felt this.",
    "Okay, have you taken any medication so far?",
    "Understood. Take adequate rest and drink plenty of warm fluids.",
  ];

  if (text.includes("fever") || text.includes("temperature") || text.includes("hot")) {
    category = "fever";
    replies = [
      "How many days have you had the fever? Is it accompanied by chills?",
      "Take Paracetamol 500mg twice daily after meals.",
      "Stay well hydrated and monitor your temperature regularly.",
    ];
  } else if (text.includes("cold") || text.includes("sneeze") || text.includes("runny")) {
    category = "cold";
    replies = [
      "Is your nose blocked or runny? Any sore throat?",
      "Try warm steam inhalation twice daily for relief.",
      "Take Cetirizine 10mg before bed if sneezing persists.",
    ];
  } else if (text.includes("cough") || text.includes("throat")) {
    category = "cough";
    replies = [
      "Is it a dry cough or with mucus?",
      "Take 10ml cough syrup three times a day after meals.",
      "Gargle with warm salt water twice daily.",
    ];
  } else if (text.includes("cancer") || text.includes("tumor") || text.includes("lump")) {
    category = "cancer";
    replies = [
      "This requires comprehensive diagnostic tests. Please visit an oncology specialist.",
      "We recommend booking an urgent in-person hospital consult.",
      "I'm noting this in your medical report.",
    ];
  }

  const reply = replyNumber < replies.length ? replies[replyNumber] : replies[replies.length - 1];
  return { reply, category };
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return m + ":" + s;
}

export default function DoctorsPage({ username }) {
  useDocumentTitle("Hospital Doctors Directory");
  const [filter, setFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [step, setStep] = useState(""); // pay, connecting, call, prescription, medpay, delivered
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyNumber, setReplyNumber] = useState(0);
  const [category, setCategory] = useState("general");
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    if (step !== "call") return;
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const filteredDoctors =
    filter === "All" ? doctorList : doctorList.filter((d) => d.specialty === filter);

  function openCall(doctor) {
    setSelectedDoctor(doctor);
    setStep("pay");
  }

  function onConsultPaySuccess() {
    setStep("connecting");
    setTimeout(() => {
      setCallSeconds(0);
      setStep("call");
      setMessages([
        { from: "doctor", text: `Hello! I am ${selectedDoctor.name}. What symptoms are you experiencing today?` },
      ]);
    }, 1500);
  }

  function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "me", text: input }];
    setMessages(newMessages);

    const result = getDoctorReply(input, replyNumber);
    setReplyNumber(replyNumber + 1);
    setCategory(result.category);
    setInput("");

    setTimeout(() => {
      setMessages([...newMessages, { from: "doctor", text: result.reply }]);
    }, 600);
  }

  function endCall() {
    setStep("prescription");
  }

  function saveConsult(medicineOrdered) {
    const entry = {
      date: new Date().toLocaleDateString(),
      doctor: selectedDoctor.name,
      duration: formatTime(callSeconds),
      medicine: medicineByCategory[category].name,
      medicineDescription: medicineByCategory[category].description,
      medicineOrdered: medicineOrdered,
      time: Date.now(),
    };
    const key = "consults_" + username;
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    localStorage.setItem(key, JSON.stringify([...list, entry]));
  }

  function onMedicinePaySuccess() {
    saveConsult(true);
    setStep("delivered");
  }

  function skipMedicine() {
    saveConsult(false);
    closeCall();
  }

  function closeCall() {
    setStep("");
    setSelectedDoctor(null);
    setMessages([]);
    setReplyNumber(0);
    setCategory("general");
    setCallSeconds(0);
  }

  if (step === "pay") {
    return (
      <PaymentModal
        title={"Consultation Fee — " + selectedDoctor.name}
        amount={selectedDoctor.price}
        onClose={closeCall}
        onSuccess={onConsultPaySuccess}
      />
    );
  }

  if (step === "connecting") {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ textAlign: "center", padding: "32px" }}>
          <div className="call-avatar" style={{ fontSize: "36px", marginBottom: "16px" }}>🧑‍⚕️</div>
          <h3 className="modal-title">Connecting to {selectedDoctor.name}...</h3>
          <p style={{ color: "#64748b", marginTop: "8px" }}>Securing encrypted consultation line</p>
        </div>
      </div>
    );
  }

  if (step === "call") {
    return (
      <div className="call-screen">
        <div className="call-header">
          <div className="call-doc-info">
            <div className="call-avatar-sm">🩺</div>
            <div>
              <div className="call-doc-name">{selectedDoctor.name}</div>
              <div className="call-doc-spec">{selectedDoctor.specialty} · Live</div>
            </div>
          </div>
          <div className="call-timer-box">
            <span className="call-dot" />
            <span className="call-timer">{formatTime(callSeconds)}</span>
          </div>
          <button className="call-end-btn" onClick={endCall}>
            End Consult
          </button>
        </div>

        <div className="call-messages">
          {messages.map((m, i) => (
            <div key={i} className={`call-bubble ${m.from === "doctor" ? "call-bubble-doc" : "call-bubble-me"}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="call-input-row">
          <input
            className="call-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your symptoms or questions..."
            autoFocus
          />
          <button className="call-send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    );
  }

  if (step === "prescription") {
    const med = medicineByCategory[category];
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ maxWidth: "480px" }}>
          <h3 className="modal-title">Prescription Summary</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
            Consultation with {selectedDoctor.name} ({formatTime(callSeconds)})
          </p>
          <div className="presc-card">
            <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>{med.name}</h4>
            <p style={{ fontSize: "13px", color: "#475569", marginBottom: "8px" }}>{med.description}</p>
            {med.price > 0 && (
              <p style={{ fontWeight: 700, color: "#0284c7" }}>Price: ₹{med.price}</p>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            {med.price > 0 && (
              <button
                className="modal-pay-btn"
                style={{ flex: 1 }}
                onClick={() => setStep("medpay")}
              >
                Order Medicine (₹{med.price})
              </button>
            )}
            <button
              className="modal-cancel-btn"
              style={{ flex: 1 }}
              onClick={skipMedicine}
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "medpay") {
    const med = medicineByCategory[category];
    return (
      <PaymentModal
        title={"Order Prescription — " + med.name}
        amount={med.price}
        onClose={() => setStep("prescription")}
        onSuccess={onMedicinePaySuccess}
      />
    );
  }

  if (step === "delivered") {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ textAlign: "center", padding: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚚</div>
          <h3 className="modal-title">Order Dispatched!</h3>
          <p style={{ color: "#64748b", margin: "12px 0 20px 0" }}>
            Your prescribed medicines have been ordered and will arrive within 5 minutes.
          </p>
          <button className="modal-pay-btn" onClick={closeCall}>
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-header">
        <h2 className="doc-title">Find a Doctor & Consult Online</h2>
        <p className="doc-subtitle">Talk to top specialists via real-time encrypted consultation</p>
      </div>

      <div className="doc-filters">
        <button
          className={`doc-filter-pill ${filter === "All" ? "active" : ""}`}
          onClick={() => setFilter("All")}
        >
          All
        </button>
        {specialties.map((s) => (
          <button
            key={s}
            className={`doc-filter-pill ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="doc-grid">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-card-top">
              <div className="doc-avatar">🧑‍⚕️</div>
              <div>
                <h3 className="doc-name">{doc.name}</h3>
                <p className="doc-spec">{doc.specialty}</p>
                <p className="doc-exp">{doc.experience} exp · ⭐ {doc.rating}</p>
              </div>
            </div>
            <div className="doc-card-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span className="doc-price">₹{doc.price} / consult</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <Link
                  to={`/doctors/${doc.id}`}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    textDecoration: "none",
                    background: "#f1f5f9",
                    color: "#0f172a",
                    fontWeight: 600,
                    border: "1px solid #cbd5e1"
                  }}
                  title="Dynamic Route (:id) with useParams"
                >
                  Profile
                </Link>
                <button className="doc-call-btn" onClick={() => openCall(doc)}>
                  Consult Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
