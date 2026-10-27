import { useState, useEffect } from "react";
import "./App.css";

// ---------- specialties for filter list ----------
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

// ---------- medicine suggestion based on symptom category ----------
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

// function that returns a doctor chat reply and the detected category
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

function Doctors({ username }) {
  const [page, setPage] = useState("history"); // history shows first
  const [filter, setFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [step, setStep] = useState(""); // pay, connecting, call, prescription, delivering, done
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [replyNumber, setReplyNumber] = useState(0);
  const [category, setCategory] = useState("general");
  const [history, setHistory] = useState([]);
  const [deliverySeconds, setDeliverySeconds] = useState(120);

  useEffect(() => {
    const saved = localStorage.getItem("cb_history_" + username);
    if (saved !== null) {
      setHistory(JSON.parse(saved));
    }
  }, [username, page]);

  // countdown timer for delivery
  useEffect(() => {
    if (step !== "delivering") return;
    if (deliverySeconds <= 0) {
      setStep("done");
      return;
    }
    const timer = setTimeout(() => setDeliverySeconds(deliverySeconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, deliverySeconds]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }

  const filteredDoctors =
    filter === "All" ? doctorList : doctorList.filter((d) => d.specialty === filter);

  function openCall(doctor) {
    setSelectedDoctor(doctor);
    setStep("pay");
  }

  function payConsultFee() {
    setStep("connecting");
    setTimeout(() => {
      setStep("call");
      setMessages([{ from: "doctor", text: "Hello, I am " + selectedDoctor.name + ". What symptoms are you having?" }]);
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

  function saveToHistory(medicineOrdered) {
    const entry = {
      date: new Date().toLocaleDateString(),
      doctor: selectedDoctor.name,
      messages: messages,
      medicine: medicineByCategory[category].name,
      medicineDescription: medicineByCategory[category].description,
      medicineOrdered: medicineOrdered,
    };
    const updatedHistory = [entry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("cb_history_" + username, JSON.stringify(updatedHistory));
  }

  function payForMedicine() {
    setStep("delivering");
    setDeliverySeconds(120);
  }

  function skipMedicine() {
    saveToHistory(false);
    setStep("done");
  }

  function closeCall() {
    setStep("");
    setSelectedDoctor(null);
    setMessages([]);
    setReplyNumber(0);
    setCategory("general");
  }

  // consult payment screen
  if (step === "pay") {
    return (
      <div className="call-overlay">
        <div className="call-box">
          <h3>Consult fee - {selectedDoctor.name}</h3>
          <p className="pay-amount">Rs {selectedDoctor.price}</p>
          <button className="btn-primary full-width" onClick={payConsultFee}>
            Pay Now
          </button>
          <button className="link-btn" onClick={closeCall}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // connecting screen
  if (step === "connecting") {
    return (
      <div className="call-overlay">
        <div className="call-box">
          <div className="doctor-avatar-big">{selectedDoctor.name.charAt(4)}</div>
          <h3>Connecting...</h3>
        </div>
      </div>
    );
  }

  // live call screen
  if (step === "call") {
    return (
      <div className="call-overlay">
        <div className="call-box call-box-tall">
          <div className="doctor-avatar-big">{selectedDoctor.name.charAt(4)}</div>
          <h3>{selectedDoctor.name}</h3>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "me" ? "msg msg-me" : "msg msg-doctor"}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="auth-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type symptom (fever, cold, cough, cancer)"
            />
            <button className="btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>

          <button className="btn-danger full-width" onClick={endCall}>
            End Call
          </button>
        </div>
      </div>
    );
  }

  // prescription screen - shown right after call ends
  if (step === "prescription") {
    const med = medicineByCategory[category];
    return (
      <div className="call-overlay">
        <div className="call-box">
          <h3>Call Ended</h3>
          <p className="doctor-specialty">Doctor's prescription:</p>
          <div className="prescription-box">
            <strong>{med.name}</strong>
            <p>{med.description}</p>
            {med.price > 0 && <p className="doctor-price">Rs {med.price}</p>}
          </div>

          {med.price > 0 ? (
            <>
              <button className="btn-primary full-width" onClick={payForMedicine}>
                Pay & Order Medicine
              </button>
              <button className="link-btn" onClick={skipMedicine}>
                Skip, don't order
              </button>
            </>
          ) : (
            <button className="btn-primary full-width" onClick={skipMedicine}>
              Okay
            </button>
          )}
        </div>
      </div>
    );
  }

  // delivering screen - 2 minute countdown after medicine payment
  if (step === "delivering") {
    return (
      <div className="call-overlay">
        <div className="call-box">
          <h3>Order Placed</h3>
          <p>Your medicine is on the way.</p>
          <p className="pay-amount">{formatTime(deliverySeconds)}</p>
          <p className="doctor-specialty">Arriving soon...</p>
        </div>
      </div>
    );
  }

  // done screen
  if (step === "done") {
    if (history.length === 0 || history[0].doctor !== selectedDoctor.name) {
      saveToHistory(true);
    }
    return (
      <div className="call-overlay">
        <div className="call-box">
          <h3>All Done</h3>
          <p>Your consultation and order details are saved in History.</p>
          <button className="btn-primary full-width" onClick={closeCall}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // main page - history or doctor list
  return (
    <div className="doctors-page">
      <div className="doctors-tabs">
        <button className={page === "history" ? "tab tab-active" : "tab"} onClick={() => setPage("history")}>
          History
        </button>
        <button className={page === "list" ? "tab tab-active" : "tab"} onClick={() => setPage("list")}>
          Doctors
        </button>
      </div>

      {page === "history" && (
        <div className="history-list">
          {history.length === 0 && <p className="empty-text">No consultations yet.</p>}
          {history.map((h, i) => (
            <div key={i} className="history-card">
              <div className="history-top">
                <strong>{h.doctor}</strong>
                <span>{h.date}</span>
              </div>
              {h.messages.map((m, j) => (
                <p key={j} className="history-msg-line">
                  {m.from === "me" ? "You" : "Doctor"}: {m.text}
                </p>
              ))}
              <div className="prescription-box">
                <strong>{h.medicine}</strong>
                <p>{h.medicineDescription}</p>
                <p className="doctor-specialty">
                  {h.medicineOrdered ? "Ordered - delivered" : "Not ordered"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {page === "list" && (
        <div>
          {/* specialty filter list at top */}
          <div className="specialty-nav">
            <button
              className={filter === "All" ? "specialty-btn specialty-btn-active" : "specialty-btn"}
              onClick={() => setFilter("All")}
            >
              All
            </button>
            {specialties.map((s) => (
              <button
                key={s}
                className={filter === s ? "specialty-btn specialty-btn-active" : "specialty-btn"}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="doctor-grid">
            {filteredDoctors.map((d) => (
              <div key={d.id} className="doctor-card">
                <h3>{d.name}</h3>
                <p className="doctor-specialty">{d.specialty}</p>
                <p className="doctor-price">Rs {d.price}</p>
                <button className="btn-primary full-width" onClick={() => openCall(d)}>
                  Call
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;
