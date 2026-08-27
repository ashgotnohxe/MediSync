import React, { useState, useEffect } from 'react';
import { loadData, saveData, HOSPITALS_SEED } from '../mock-storage';

function DoctorBedsPage() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // First time loading, use HOSPITALS_SEED
      const data = await loadData("beds", true, HOSPITALS_SEED);
      setBeds(data);
      setLoading(false);
    })();
  }, []);

  const updateBeds = async (hospitalId, delta) => {
    // Read-modify-write pattern
    const updatedBeds = beds.map(hospital => {
      if (hospital.id === hospitalId) {
        const newAvailable = Math.max(0, Math.min(hospital.total, hospital.available + delta));
        return { ...hospital, available: newAvailable };
      }
      return hospital;
    });

    // Update local state
    setBeds(updatedBeds);
    
    // Save entire array back to shared storage
    await saveData("beds", updatedBeds, true);
  };

  if (loading) {
    return <div className="page-container"><p>Loading hospital beds...</p></div>;
  }

  return (
    <div className="page-container">
      <h2>Bed Availability Management</h2>
      <p className="subtitle">Update emergency bed counts across connected hospitals.</p>
      
      <div className="card-list">
        {beds.map(hospital => {
          const isAvailable = hospital.available > 0;
          const percentage = (hospital.available / hospital.total) * 100;
          
          return (
            <div key={hospital.id} className="card bed-card">
              <div className="card-header">
                <div>
                  <h3>{hospital.name}</h3>
                  <div className="tags">
                    {hospital.type && <span className="badge red-badge">{hospital.type}</span>}
                    {hospital.categories?.map(cat => (
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
