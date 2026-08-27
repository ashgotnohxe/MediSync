import React from "react";
import "./App.css";

function Emergency() {
  const hospitals = [
    {
      name: "City Care Hospital",
      beds: 6,
      total: 20,
    },
    {
      name: "Sunrise Multispeciality",
      beds: 2,
      total: 15,
    },
    {
      name: "Apollo Clinic",
      beds: 11,
      total: 18,
    },
  ];

  const contacts = [
    { icon: "🚑", name: "Ambulance", number: "108" },
    { icon: "🚓", name: "Police", number: "100" },
    { icon: "🚒", name: "Fire", number: "101" },
    { icon: "📞", name: "Women Helpline", number: "1091" },
  ];

  return (
    <div className="emergency-page">
      <div className="emergency-container">

        <h1>Emergency</h1>

        <p className="emergency-subtitle">
          Get help fast — one tap alerts nearby hospitals
        </p>

        <h2>Nearby hospitals</h2>

        <div className="hospital-list">
          {hospitals.map((hospital) => {
            const percentage =
              (hospital.beds / hospital.total) * 100;

            return (
              <div className="hospital-card" key={hospital.name}>
                <div className="hospital-info">
                  <div>
                    <h3>{hospital.name}</h3>
                    <p>Beds available</p>
                  </div>

                  <span
                    className={
                      hospital.beds <= 3
                        ? "bed-count low"
                        : "bed-count"
                    }
                  >
                    {hospital.beds}/{hospital.total}
                  </span>
                </div>

                <div className="progress-background">
                  <div
                    className={
                      hospital.beds <= 3
                        ? "progress-bar low"
                        : "progress-bar"
                    }
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="contacts-heading">
          Emergency contacts
        </h2>

        <div className="contacts-grid">
          {contacts.map((contact) => (
            <div className="contact-card" key={contact.name}>
              <div className="contact-icon">
                {contact.icon}
              </div>

              <p>{contact.name}</p>

              <strong>{contact.number}</strong>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Emergency;