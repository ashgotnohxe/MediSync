import { useState, useEffect } from "react";
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

const doctorNames = [
  "Ananya Rao", "Vikram Sen", "Meera Iyer", "Farhan Ali", "Kavita Joshi",
  "Rohan Das", "Priya Nair", "Sanjay Mehta", "Neha Kapoor", "Arjun Singh",
  "Divya Menon", "Karan Malhotra", "Simran Kaur", "Aditya Verma", "Pooja Sharma",
  "Rahul Khanna", "Ritu Bansal", "Manish Gupta", "Sneha Reddy", "Amit Chopra",
  "Kritika Sinha", "Nikhil Bhatia", "Anjali Desai", "Suresh Pillai", "Tanvi Shah",
  "Deepak Yadav", "Ishita Roy", "Varun Kapoor", "Payal Agarwal", "Gaurav Nanda",
  "Swati Kulkarni", "Rajesh Pandey", "Nidhi Trivedi", "Harsh Vora", "Komal Saxena",
  "Yash Thakur", "Alisha Fernandes", "Mohit Chawla", "Preeti Rawat", "Siddharth Menon",
];

const doctorList = doctorNames.map((name, index) => ({
  id: index + 1,
  name: "Dr. " + name,
  specialty: specialties[index % specialties.length],
  price: 150 + (index % 8) * 30,
  experience: (5 + (index % 12)) + " yrs",
  rating: (4.5 + ((index % 5) * 0.1)).toFixed(1),
}));

// Fake API (real project me yahan fetch("/api/doctors") aayega)
function fetchDoctorsFromApi() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(doctorList), 800);
  });
}

// Profile modal ke liye extra details (doctor ke id se bante hain)
function getProfileDetails(doctor) {
  const index = doctor.id - 1;
  const days = ["Monday - Saturday", "Monday - Friday", "Tuesday - Sunday"];
  const timings = ["09:00 AM - 05:00 PM", "10:00 AM - 06:00 PM", "08:00 AM - 02:00 PM"];
  const wings = ["A", "B", "C"];
  return {
    days: days[index % days.length],
    timing: timings[index % timings.length],
    branch: "MediSync Central Healthcare, Wing " + wings[index % wings.length],
  };
}

// ---------- Debounce hook (search ke liye) ----------
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PAGE_SIZE = 9;

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
  const [filter, setFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [step, setStep] = useState(""); // pay, connecting, call, prescription, medpay, delivered
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyNumber, setReplyNumber] = useState(0);
  const [category, setCategory] = useState("general");
  const [callSeconds, setCallSeconds] = useState(0);
  const [profileDoctor, setProfileDoctor] = useState(null); // Profile modal

  // New states: API data, loading, error
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // New states: search, sort, pagination
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const debouncedSearch = useDebounce(search, 400);

  async function loadDoctors() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchDoctorsFromApi();
      setDoctors(data);
    } catch (e) {
      setLoadError("Could not load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  // Filter / search / sort badalne par pagination reset
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, debouncedSearch, sortBy]);

  // Esc dabane par Profile modal band ho jaye
  useEffect(() => {
    if (!profileDoctor) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setProfileDoctor(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [profileDoctor]);

  useEffect(() => {
    if (step !== "call") return;
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Filter -> Search -> Sort
  let filteredDoctors = doctors.filter((d) => {
    const matchesFilter = filter === "All" || d.specialty === filter;
    const q = debouncedSearch.trim().toLowerCase();
    const matchesSearch =
      q === "" || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  if (sortBy === "priceLow") filteredDoctors = [...filteredDoctors].sort((a, b) => a.price - b.price);
  if (sortBy === "priceHigh") filteredDoctors = [...filteredDoctors].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filteredDoctors = [...filteredDoctors].sort((a, b) => Number(b.rating) - Number(a.rating));

  const visibleDoctors = filteredDoctors.slice(0, visibleCount);

  function consultFromProfile(doctor) {
    setProfileDoctor(null);
    openCall(doctor);
  }

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

      {/* Search + Sort */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          className="auth-input"
          style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}
          placeholder="🔍 Search doctor or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="auth-input"
          style={{ width: "200px", marginBottom: 0 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="rating">Rating: Best First</option>
        </select>
      </div>

      {/* Filter pills (tabs) */}
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

      {/* Loading / Error / Empty / List */}
      {loading && <p style={{ padding: "30px", textAlign: "center" }}>⏳ Loading doctors...</p>}

      {!loading && loadError && (
        <div style={{ padding: "30px", textAlign: "center" }}>
          <p className="appt-error">{loadError}</p>
          <button className="doc-call-btn" onClick={loadDoctors}>
            Retry
          </button>
        </div>
      )}

      {!loading && !loadError && filteredDoctors.length === 0 && (
        <p style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
          No doctors found. Try a different search.
        </p>
      )}

      {!loading && !loadError && filteredDoctors.length > 0 && (
        <>
          <div className="doc-grid">
            {visibleDoctors.map((doc) => (
              <div key={doc.id} className="doc-card">
                <div className="doc-card-top">
                  <div className="doc-avatar">🧑‍⚕️</div>
                  <div>
                    <h3 className="doc-name">{doc.name}</h3>
                    <p className="doc-spec">{doc.specialty}</p>
                    <p className="doc-exp">{doc.experience} exp · ⭐ {doc.rating}</p>
                  </div>
                </div>
                <div className="doc-card-bottom">
                  <span className="doc-price">₹{doc.price} / consult</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="modal-cancel-btn"
                      style={{ width: "auto", padding: "6px 14px", fontSize: "13px" }}
                      onClick={() => setProfileDoctor(doc)}
                    >
                      Profile
                    </button>
                    <button className="doc-call-btn" onClick={() => openCall(doc)}>
                      Consult Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination: Load More */}
          {visibleCount < filteredDoctors.length && (
            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <button className="doc-call-btn" onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
                Load More ({filteredDoctors.length - visibleCount} left)
              </button>
            </div>
          )}
        </>
      )}

      {/* ---------- Profile Modal ---------- */}
      {profileDoctor && (
        <div className="modal-overlay" onClick={() => setProfileDoctor(null)}>
          {/* box ke andar click karne se modal band nahi hoga */}
          <div className="modal-box" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <h3 className="modal-title">{profileDoctor.name}</h3>
                <p style={{ color: "#0284c7", fontSize: "14px", fontWeight: 600 }}>{profileDoctor.specialty}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: "13px" }}>⭐ {profileDoctor.rating} / 5.0</span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "14px 0" }} />

            <div style={{ fontSize: "14px", lineHeight: "1.9" }}>
              <p><strong>Doctor ID:</strong> {profileDoctor.id}</p>
              <p><strong>Department:</strong> {profileDoctor.specialty}</p>
              <p><strong>Clinical Experience:</strong> {profileDoctor.experience}</p>
              <p><strong>Consultation Days:</strong> {getProfileDetails(profileDoctor).days}</p>
              <p><strong>OPD Timings:</strong> {getProfileDetails(profileDoctor).timing}</p>
              <p><strong>Hospital Branch:</strong> {getProfileDetails(profileDoctor).branch}</p>
              <p><strong>Consultation Fee:</strong> ₹{profileDoctor.price}</p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="modal-pay-btn"
                style={{ flex: 1 }}
                onClick={() => consultFromProfile(profileDoctor)}
              >
                Consult Now
              </button>
              <button
                className="modal-cancel-btn"
                style={{ flex: 1 }}
                onClick={() => setProfileDoctor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
