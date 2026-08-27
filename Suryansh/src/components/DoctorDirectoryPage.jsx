import React, { useState } from 'react';
import { DOCTORS } from '../mock-storage';

function DoctorDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = DOCTORS.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <h2>Doctor Directory</h2>
      <p className="subtitle">Browse all healthcare professionals in the CareBridge network.</p>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search by name or specialty..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="empty-state">
          <p>No doctors found matching your search.</p>
        </div>
      ) : (
        <div className="card-list">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="card doctor-card">
              <div className="avatar-circle">
                <span className="avatar-icon">🧑‍⚕️</span>
              </div>
              <div className="card-info">
                <h3>{doctor.name}</h3>
                <p className="specialty-text">{doctor.specialty} • {doctor.experience} experience</p>
                <div className="rating">
                  ⭐ {doctor.rating} Rating
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorDirectoryPage;
