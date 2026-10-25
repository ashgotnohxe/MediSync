import { useState, useEffect } from "react";
import { loadData, HOSPITALS_SEED } from "../mock-storage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import HealthTips from "./HealthTips";
import "../App.css";


const CONTACTS = [
  { label: "Ambulance", number: "108", icon: "🚑" },
  { label: "Emergency Central", number: "112", icon: "🚨" },
  { label: "Police Assistance", number: "100", icon: "🚓" },
  { label: "Fire & Rescue", number: "101", icon: "🚒" },
  { label: "Women Helpline", number: "1091", icon: "📞" },
];

function InputField({ label, name, value, onChange, error, placeholder }) {
  return (
    <div className="emg3-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? "emg3-input emg3-input-error" : "emg3-input"}
      />
      {error && <p className="emg3-error-text">{error}</p>}
    </div>
  );
}

export default function EmergencyPage({ username }) {
  // Concept: Custom Hook - dynamically sets page title in browser tab
  useDocumentTitle("Emergency & Hospital Beds");

  // ----- Hospital beds ke states -----
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("none");

  const [myContacts, setMyContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({});


  const [message, setMessage] = useState({ text: "", bad: false });

  const storageKey = "emg_contacts_" + username;

  useEffect(() => {
    loadBeds();
    loadMyContacts();
  }, [username]);

  function showMessage(text, bad) {
    setMessage({ text: text, bad: !!bad });
    setTimeout(() => setMessage({ text: "", bad: false }), 2500); // 2.5 sec baad hata do
  }

 
  async function loadBeds() {
    setLoading(true);
    setError("");
    try {
      const data = await loadData("beds", true, HOSPITALS_SEED);
      setHospitals(data);
    } catch (e) {
      setError("Could not load hospital beds. Please try again.");
    }
    setLoading(false);
  }


  let list = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );


  function beds(h) {
    return h.available !== undefined ? h.available : h.beds !== undefined ? h.beds : 0;
  }
  if (sort === "high") list = [...list].sort((a, b) => beds(b) - beds(a));
  if (sort === "low") list = [...list].sort((a, b) => beds(a) - beds(b));

  
  function loadMyContacts() {
    try {
      const saved = localStorage.getItem(storageKey);
      setMyContacts(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error(e);
    }
  }

  function saveContacts(newList) {
    setMyContacts(newList);
    localStorage.setItem(storageKey, JSON.stringify(newList));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }


  function validate() {
    const newErrors = {};
    if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 letters";
    }
    if (!/^[6-9][0-9]{9}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    } else if (myContacts.some((c) => c.phone === form.phone)) {
      newErrors.phone = "This number is already added";
    }
    return newErrors;
  }

  function addContact(e) {
    e.preventDefault(); 
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; // error hai to ruk jao

    const newContact = { id: Date.now(), name: form.name.trim(), phone: form.phone };
    saveContacts([...myContacts, newContact]);
    setForm({ name: "", phone: "" });
    showMessage(newContact.name + " added");
  }

  function deleteContact(id) {
    saveContacts(myContacts.filter((c) => c.id !== id));
    showMessage("Contact removed", true);
  }

  return (
    <div className="emg-page">
      <div className="emg-header">
        <h2 className="emg-heading">Emergency & Live Hospital Beds</h2>
        <p className="emg-subheading">
          Emergency hotlines, real-time hospital bed status and your emergency contacts
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 className="emg-section-title" style={{ margin: 0 }}>
          🏥 Connected Hospital Bed Availability (Live)
        </h3>
        <button onClick={loadBeds} className="hist-refresh-btn">
          🔄 Refresh Beds
        </button>
      </div>

      <div className="emg3-controls">
        <input
          className="emg3-input emg3-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hospital by name..."
        />
        <select className="emg3-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="none">Sort: default</option>
          <option value="high">Most beds first</option>
          <option value="low">Least beds first</option>
        </select>
      </div>

      {loading && <p className="emg3-muted">Loading hospital bed status...</p>}

      {error !== "" && (
        <div>
          <p className="emg3-error-text">{error}</p>
          <button className="emg3-btn" onClick={loadBeds}>Retry</button>
        </div>
      )}

      {!loading && error === "" && list.length === 0 && (
        <p className="emg3-muted">No hospitals found.</p>
      )}

      {!loading && error === "" && (
        <div className="emg-hospitals-grid">
          {list.map((h) => {
            const available = beds(h);
            const total = h.total !== undefined ? h.total : h.totalBeds !== undefined ? h.totalBeds : 20;
            const pct = Math.round((available / total) * 100);
            const isLow = available <= 3;

            return (
              <div key={h.id || h.name} className="emg-hospital-card">
                <div className="emg-hospital-top">
                  <span className="emg-hospital-name">{h.name}</span>
                  {h.distance && <span className="emg-hospital-dist">{h.distance}</span>}
                </div>
                <div className="emg-beds-row">
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Emergency Beds Available</span>
                  <span className={`emg-beds-count ${isLow ? "low" : "ok"}`}>
                    {available} / {total} free
                  </span>
                </div>
                <div className="emg-bar-track">
                  <div
                    className={`emg-bar-fill ${isLow ? "low" : "ok"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

    
      <h3 className="emg-section-title" style={{ marginTop: "36px" }}>
        👨‍👩‍👧 My Emergency Contacts
      </h3>

      <div className="emg3-two">
        {/* Form */}
        <div className="emg3-card">
          <h4>Add a contact</h4>
          <form className="emg3-form" onSubmit={addContact} noValidate>
            <InputField
              label="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Alice"
            />
            <InputField
              label="Mobile number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="9876543210"
            />
            <button type="submit" className="emg3-btn">Save Contact</button>
          </form>
        </div>

    
        <div className="emg3-card">
          <h4>Saved contacts ({myContacts.length})</h4>
          {myContacts.length === 0 && <p className="emg3-muted">No contacts added yet.</p>}
          {myContacts.map((c) => (
            <div key={c.id} className="emg3-row">
              <div>
                <strong>{c.name}</strong>
                <small>{c.phone}</small>
              </div>
              <button className="emg3-btn emg3-btn-red" onClick={() => deleteContact(c.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>


      <h3 className="emg-section-title" style={{ marginTop: "36px" }}>
        📞 Emergency Hotlines & Rescue Numbers
      </h3>
      <div className="emg-contacts-grid">
        {CONTACTS.map((c) => (
          <a key={c.label} href={`tel:${c.number}`} className="emg-contact-card">
            <span className="emg-contact-icon">{c.icon}</span>
            <span className="emg-contact-label">{c.label}</span>
            <span className="emg-contact-number">{c.number}</span>
          </a>
        ))}
      </div>

      {/* VIVA TOPIC: API Handling Demonstration (fetch + useEffect) */}
      <div style={{ marginTop: "36px" }}>
        <HealthTips />
      </div>

      {message.text !== "" && (
        <div className={message.bad ? "emg3-toast bad" : "emg3-toast"}>{message.text}</div>
      )}
    </div>
  );
}