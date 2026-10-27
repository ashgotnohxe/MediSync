import { useState, useEffect } from 'react';
import { loadData, PATIENTS_SEED } from '../mock-storage';

// DoctorPatientsPage: Lists all registered patients in the hospital system
function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load patients from shared storage on mount
  useEffect(() => {
    async function fetchPatients() {
      try {
        // Fallback to PATIENTS_SEED so initial patient list isn't empty
        const data = await loadData("patients_registry", true, PATIENTS_SEED);
        setPatients(data || []);
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  // Derived filtered list computed during render (never stored in state)
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (p.name || '').toLowerCase().includes(term);
    const phoneMatch = (p.phone || '').toLowerCase().includes(term);
    return nameMatch || phoneMatch;
  });

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Registered Patients</h2>
      <p className="subtitle">View all patients registered in the MediSync system.</p>
      
      {/* Search filter input */}
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
          {filteredPatients.map((patient) => (
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
