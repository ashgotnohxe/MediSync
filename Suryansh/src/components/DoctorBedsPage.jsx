import { useState, useEffect } from 'react';
import { loadData, saveData, HOSPITALS_SEED } from '../mock-storage';

// DoctorBedsPage: Manage emergency bed availability across connected hospitals
function DoctorBedsPage() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load hospital beds from shared storage on mount
  useEffect(() => {
    async function fetchBeds() {
      try {
        const data = await loadData("beds", true, HOSPITALS_SEED);
        setBeds(data || HOSPITALS_SEED);
      } catch (err) {
        console.error("Failed to load beds:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBeds();
  }, []);

  // Read-modify-write pattern to update available beds for a hospital
  const updateBeds = async (hospitalId, delta) => {
    const updatedBeds = beds.map((hospital) => {
      if (hospital.id === hospitalId) {
        // Clamp bed count between 0 and hospital.total
        const newAvailable = Math.max(0, Math.min(hospital.total, hospital.available + delta));
        // Keep both 'available' and 'beds' fields in sync for EmergencyPage
        return { ...hospital, available: newAvailable, beds: newAvailable };
      }
      return hospital;
    });

    // Update local state
    setBeds(updatedBeds);
    
    // Save entire array back to shared storage
    try {
      await saveData("beds", updatedBeds, true);
    } catch (err) {
      console.error("Failed to save bed update:", err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading hospital beds...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Bed Availability Management</h2>
      <p className="subtitle">Update emergency bed counts across connected hospitals.</p>
      
      <div className="card-list">
        {beds.map((hospital) => {
          const isAvailable = hospital.available > 0;
          const percentage = (hospital.available / hospital.total) * 100;
          
          return (
            <div key={hospital.id} className="card bed-card">
              <div className="card-header">
                <div>
                  <h3>{hospital.name}</h3>
                  <div className="tags">
                    {hospital.type && <span className="badge red-badge">{hospital.type}</span>}
                    {hospital.categories?.map((cat) => (
                      <span key={cat} className="badge blue-badge">{cat}</span>
                    ))}
                  </div>
                </div>
                <div className={`status ${isAvailable ? 'status-green' : 'status-red'}`}>
                  {hospital.available} / {hospital.total} free
                </div>
              </div>
              
              <div className="progress-container">
                <div 
                  className={`progress-bar ${isAvailable ? 'bg-green' : 'bg-red'}`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="bed-controls">
                <button 
                  className="control-btn" 
                  onClick={() => updateBeds(hospital.id, -1)}
                  disabled={hospital.available === 0}
                  aria-label="Decrease bed count"
                >
                  −
                </button>
                <div className="control-value">
                  <span className="big-number">{hospital.available}</span>
                  <span className="small-text">Available</span>
                </div>
                <button 
                  className="control-btn" 
                  onClick={() => updateBeds(hospital.id, 1)}
                  disabled={hospital.available === hospital.total}
                  aria-label="Increase bed count"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DoctorBedsPage;
