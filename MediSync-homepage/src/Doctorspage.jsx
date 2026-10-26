import { useState, useEffect } from "react";

// ---------- specialties for filter row ----------
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

// ---------- Real API (REST API with fetch) ----------
// Free public API, key ki zarurat nahi. 40 users laata hai, unhe doctors bana dete hain.
const API_URL = "https://dummyjson.com/users?limit=40&select=firstName,lastName";

async function fetchDoctorsFromApi() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server error " + res.status);
  const data = await res.json();

  // API se sirf naam aata hai, baaki details (specialty, price...) yahan add karte hain
  return data.users.map((u, index) => ({
    id: u.id,
    name: "Dr. " + u.firstName + " " + u.lastName,
    specialty: specialties[index % specialties.length],
    price: 150 + (index % 8) * 30,
    experience: (5 + (index % 12)) + " yrs",
    rating: (4.5 + ((index % 5) * 0.1)).toFixed(1),
  }));
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

// ---------- medicine suggested based on symptom keyword ----------
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
    description: "No medicine can be prescribed online. Please visit an oncologist for tests as soon as possible.",
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
    "I understand, please tell me more.",
    "How long have you had this problem?",
    "Okay, take rest and drink plenty of water.",
  ];

  if (text.includes("fever")) {
    category = "fever";
    replies = [
      "How many days have you had the fever?",
      "Take Paracetamol 500mg, twice a day after food.",
      "Drink plenty of fluids and take rest.",
    ];
  } else if (text.includes("cold")) {
    category = "cold";
    replies = [
      "Is your nose blocked or runny?",
      "Try steam inhalation, it will help.",
      "Avoid cold food and drinks for now.",
    ];
  } else if (text.includes("cough")) {
    category = "cough";
    replies = [
      "Is it a dry cough or with mucus?",
      "Take cough syrup three times a day.",
      "Gargle with warm salt water.",
    ];
  } else if (text.includes("cancer")) {
    category = "cancer";
    replies = [
      "This is a serious concern, please share more details.",
      "You should see a specialist in person right away.",
      "We can help you book a specialist appointment.",
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

// simple inline payment modal (kept in this file so the bundle stays self-contained)
function PaymentModal({ title, amount, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  function pay() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 1200);
  }
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-amount">Amount: Rs {amount}</p>
        <button onClick={pay} disabled={processing} className="modal-pay-btn">
          {processing ? "Processing..." : `Pay Rs ${amount}`}
        </button>
        <button onClick={onClose} className="modal-cancel-btn">Cancel</button>
      </div>
    </div>
  );
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

  // live call duration counter - counts up every second while call is active
  useEffect(() => {
    if (step !== "call") return;
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Esc dabane par Profile modal band ho jaye
  useEffect(() => {
    if (!profileDoctor) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setProfileDoctor(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [profileDoctor]);

  // API data, loading, error
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // search, sort, pagination
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const debouncedSearch = useDebounce(search, 400);

  // Loading + error handling + retry (3 koshish)
  async function loadDoctors() {
    setLoading(true);
    setLoadError("");

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const data = await fetchDoctorsFromApi();
        setDoctors(data);
        setLoading(false);
        return;
      } catch (e) {
        // thoda ruk ke dobara try karo
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    setLoadError("Could not load doctors. Please check your internet and try again.");
    setLoading(false);
  }

  // page khulte hi doctors load karo
  useEffect(() => {
    loadDoctors();
  }, []);

  // filter / search / sort badalne par pagination reset
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, debouncedSearch, sortBy]);

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
        { from: "doctor", text: "Hello, I am " + selectedDoctor.name + ". What symptoms are you having?" },
      ]);
    }, 2000);
  }

  function sendMessage() {
    if (input === "") return;

    const newMessages = [...messages, { from: "me", text: input }];
    setMessages(newMessages);

    const result = getDoctorReply(input, replyNumber);
    setReplyNumber(replyNumber + 1);
    setCategory(result.category);
    setInput("");

    setTimeout(() => {
      setMessages([...newMessages, { from: "doctor", text: result.reply }]);
    }, 700);
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

  // ---------- consult fee payment ----------
  if (step === "pay") {
    return (
      <PaymentModal
        title={"Consult fee - " + selectedDoctor.name}
        amount={selectedDoctor.price}
        onClose={closeCall}
        onSuccess={onConsultPaySuccess}
      />
    );
  }

  // ---------- connecting screen ----------
  if (step === "connecting") {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ textAlign: "center" }}>
          <div className="call-avatar">{selectedDoctor.name.charAt(4)}</div>
          <h3 className="modal-title">Connecting...</h3>
        </div>
      </div>
    );
  }

  // ---------- live call screen with running duration counter ----------
  if (step === "call") {
    return (
      <div className="modal-overlay">
        <div className="modal-box call-box-tall">
          <div className="call-header">
            <div className="call-avatar">{selectedDoctor.name.charAt(4)}</div>
            <h3 className="modal-title">{selectedDoctor.name}</h3>
            <p className="call-timer">Call duration: {formatTime(callSeconds)}</p>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "me" ? "chat-msg chat-msg-me" : "chat-msg chat-msg-doctor"}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="med-search-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type symptom (fever, cold, cough, cancer)"
            />
            <button className="med-search-btn" onClick={sendMessage}>
              Send
            </button>
          </div>

          <button className="appt-cancel-btn full-btn" onClick={endCall}>
            End Call
          </button>
        </div>
      </div>
    );
  }

  // ---------- prescription screen after call ends ----------
  if (step === "prescription") {
    const med = medicineByCategory[category];
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ textAlign: "center" }}>
          <h3 className="modal-title">Call Ended</h3>
          <p className="med-subtitle">Duration: {formatTime(callSeconds)}</p>
          <div className="prescription-box">
            <strong>{med.name}</strong>
            <p>{med.description}</p>
            {med.price > 0 && <p className="med-price">Rs {med.price}</p>}
          </div>

          {med.price > 0 ? (
            <>
              <button className="home-cta full-btn" onClick={() => setStep("medpay")}>
                Pay & Order Medicine
              </button>
              <button className="modal-cancel-btn" onClick={skipMedicine}>
                Skip, don't order
              </button>
            </>
          ) : (
            <button className="home-cta full-btn" onClick={skipMedicine}>
              Okay
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- medicine payment ----------
  if (step === "medpay") {
    const med = medicineByCategory[category];
    return (
      <PaymentModal
        title={"Medicine - " + med.name}
        amount={med.price}
        onClose={() => setStep("prescription")}
        onSuccess={onMedicinePaySuccess}
      />
    );
  }

  // ---------- delivery confirmation - no countdown, just a message ----------
  if (step === "delivered") {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ textAlign: "center" }}>
          <h3 className="modal-title">Order Placed</h3>
          <p className="med-subtitle">
            Your medicine will arrive at your doorstep within 5-7 minutes.
          </p>
          <button className="home-cta full-btn" onClick={closeCall}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // ---------- main doctor list ----------
  return (
    <div className="med-page">
      <h2 className="med-title">Find a Doctor</h2>
      <p className="med-subtitle">Choose a specialty and start a call with an available doctor</p>

      {/* Search + Sort */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          className="med-search-input"
          placeholder="Search doctor or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="med-search-input"
          style={{ flex: "0 0 200px" }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="rating">Rating: Best First</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div className="appt-doctors">
        <button
          className={"appt-doc-btn" + (filter === "All" ? " selected" : "")}
          onClick={() => setFilter("All")}
        >
          All
        </button>
        {specialties.map((s) => (
          <button
            key={s}
            className={"appt-doc-btn" + (filter === s ? " selected" : "")}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loading / Error / Empty / List */}
      {loading && <p className="med-subtitle" style={{ textAlign: "center", padding: "30px" }}>Loading doctors...</p>}

      {!loading && loadError && (
        <div style={{ padding: "30px", textAlign: "center" }}>
          <p className="appt-error">{loadError}</p>
          <button className="med-add-btn" style={{ padding: "8px 20px" }} onClick={loadDoctors}>
            Retry
          </button>
        </div>
      )}

      {!loading && !loadError && filteredDoctors.length === 0 && (
        <p className="med-subtitle" style={{ textAlign: "center", padding: "30px" }}>
          No doctors found. Try a different search.
        </p>
      )}

      {!loading && !loadError && filteredDoctors.length > 0 && (
        <>
          <div className="med-grid">
            {visibleDoctors.map((d) => (
              <div key={d.id} className="med-card">
                <span className="med-tag">{d.specialty}</span>
                <h4 className="med-name">{d.name}</h4>
                <p className="med-subtitle" style={{ marginBottom: "8px" }}>
                  {d.experience} exp · ⭐ {d.rating}
                </p>
                <div className="med-bottom-row">
                  <span className="med-price">Rs {d.price}</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="modal-cancel-btn"
                      style={{ width: "auto", padding: "6px 14px", fontSize: "12px", borderRadius: "999px" }}
                      onClick={() => setProfileDoctor(d)}
                    >
                      Profile
                    </button>
                    <button className="med-add-btn" onClick={() => openCall(d)}>
                      Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination: Load More */}
          {visibleCount < filteredDoctors.length && (
            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <button
                className="med-add-btn"
                style={{ padding: "10px 24px", fontSize: "14px" }}
                onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
              >
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
          <div
            className="modal-box"
            style={{ width: "440px", maxWidth: "92vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <h3 className="modal-title">{profileDoctor.name}</h3>
                <span className="med-tag">{profileDoctor.specialty}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap" }}>
                ⭐ {profileDoctor.rating} / 5.0
              </span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "14px 0" }} />

            <div style={{ fontSize: "14px", lineHeight: "1.9" }}>
              <p><strong>Doctor ID:</strong> {profileDoctor.id}</p>
              <p><strong>Department:</strong> {profileDoctor.specialty}</p>
              <p><strong>Clinical Experience:</strong> {profileDoctor.experience}</p>
              <p><strong>Consultation Days:</strong> {getProfileDetails(profileDoctor).days}</p>
              <p><strong>OPD Timings:</strong> {getProfileDetails(profileDoctor).timing}</p>
              <p><strong>Hospital Branch:</strong> {getProfileDetails(profileDoctor).branch}</p>
              <p><strong>Consultation Fee:</strong> Rs {profileDoctor.price}</p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="modal-pay-btn"
                style={{ flex: 1, marginBottom: 0 }}
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
