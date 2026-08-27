import React, { useState, useEffect } from 'react';
import { loadData } from '../mock-storage';

function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadData("patients_registry", true, []);
      setPatients(data);
      setLoading(false);
    })();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.phone && p.phone.includes(searchTerm))
  );

  if (loading) {
    return <div className="page-container"><p>Loading patients...</p></div>;
  }

  return (
    <div className="page-container">
      <h2>Registered Patients</h2>
      <p className="subtitle">View all patients registered in the CareBridge system.</p>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {patients.length === 0 ? (
        <div className="empty-state">
          <p>No patients registered yet.</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">
          <p>No patients found matching your search.</p>
        </div>
      ) : (
        <div className="card-list">
          {filteredPatients.map(patient => (
            <div key={patient.id} className="card patient-card">
              <div className="card-header">
                <h3>{patient.name}</h3>
                <span className="badge sky-badge">{patient.bloodGroup || 'N/A'}</span>
              </div>
              <div className="card-body">
                <p><strong>Age:</strong> {patient.age || 'Unknown'}</p>
                <p><strong>Phone:</strong> {patient.phone || 'No contact'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorPatientsPage;
