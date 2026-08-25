import { useState, useEffect } from "react";
import PaymentModal from "./PaymentModal";

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

// ---------- 40 doctors ----------
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

const doctorList = doctorNames.map((name, index) => {
  return {
    id: index + 1,
    name: "Dr. " + name,
    specialty: specialties[index % specialties.length],
    price: 150 + (index % 8) * 30,
  };
});

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

export default function DoctorsPage({ username }) {
  const [filter, setFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [step, setStep] = useState(""); // pay, connecting, call, prescription, medpay, delivered
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyNumber, setReplyNumber] = useState(0);
  const [category, setCategory] = useState("general");
  const [callSeconds, setCallSeconds] = useState(0);

  // live call duration counter - counts up every second while call is active
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
    setStep("");
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

      <div className="med-grid doc-grid">
        {filteredDoctors.map((d) => (
          <div key={d.id} className="med-card">
            <span className="med-tag">{d.specialty}</span>
            <h4 className="med-name">{d.name}</h4>
            <div className="med-bottom-row">
              <span className="med-price">Rs {d.price}</span>
              <button className="med-add-btn" onClick={() => openCall(d)}>
                Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}