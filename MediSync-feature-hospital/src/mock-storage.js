// Mock storage implementation for local development & storage sync in MediSync-feature-hospital
window.storage = {
  data: {},
  async get(key, shared) {
    const fullKey = shared ? `shared_${key}` : `local_${key}`;
    const stored = localStorage.getItem(fullKey);
    return stored ? JSON.parse(stored) : null;
  },
  async set(key, value, shared) {
    const fullKey = shared ? `shared_${key}` : `local_${key}`;
    localStorage.setItem(fullKey, JSON.stringify(value));
  },
  async delete(key, shared) {
    const fullKey = shared ? `shared_${key}` : `local_${key}`;
    localStorage.removeItem(fullKey);
  }
};

export const loadData = async (key, shared, fallback) => {
  const data = await window.storage.get(key, shared);
  return data !== null ? data : fallback;
};

export const saveData = async (key, value, shared) => {
  await window.storage.set(key, value, shared);
};

// Hospital Beds Seed Data
export const HOSPITALS_SEED = [
  { id: 1, name: "City Care Hospital", distance: "1.2 km away", type: "24x7 Emergency", categories: ["Cardiac", "Trauma", "General"], available: 14, total: 60, phone: "011-23456781" },
  { id: 2, name: "CareBridge Multispeciality", distance: "2.8 km away", type: "24x7 Emergency", categories: ["Cardiac", "Neuro"], available: 3, total: 40, phone: "011-23456782" },
  { id: 3, name: "Sunrise Children's Hospital", distance: "3.5 km away", type: "Pediatric & Maternity", categories: ["Pediatric"], available: 9, total: 30, phone: "011-23456783" },
  { id: 4, name: "Apex Trauma & Ortho Care", distance: "4.1 km away", type: "Trauma Care", categories: ["Ortho", "Trauma"], available: 7, total: 25, phone: "011-23456784" }
];

// Hospital Doctors Seed Data
export const DOCTORS = [
  { id: 1, name: "Dr. Ananya Rao", specialty: "Cardiologist", experience: "12 yrs", rating: 4.9 },
  { id: 2, name: "Dr. Vikram Sen", specialty: "General Physician", experience: "8 yrs", rating: 4.7 },
  { id: 3, name: "Dr. Meera Iyer", specialty: "Pediatrician", experience: "10 yrs", rating: 4.8 },
  { id: 4, name: "Dr. Farhan Ali", specialty: "Neurologist", experience: "15 yrs", rating: 4.6 },
  { id: 5, name: "Dr. Kavita Joshi", specialty: "General Physician", experience: "9 yrs", rating: 4.9 },
  { id: 6, name: "Dr. Rohan Das", specialty: "Orthopedic", experience: "7 yrs", rating: 4.5 },
  { id: 7, name: "Dr. Priya Nair", specialty: "Dermatologist", experience: "11 yrs", rating: 4.8 },
  { id: 8, name: "Dr. Sanjay Mehta", specialty: "Cardiologist", experience: "14 yrs", rating: 4.6 }
];

export const PATIENTS_SEED = [
  { id: "p1", name: "Ravi Kumar", age: 34, bloodGroup: "O+", phone: "+91 9876543210" },
  { id: "p2", name: "Ayesha Khan", age: 28, bloodGroup: "A-", phone: "+91 9876543211" }
];

export const QUEUE_SEED = [
  { id: 1, patientName: "Rahul Verma", time: "10:30 AM", status: "waiting" },
  { id: 2, patientName: "Sneha Kapoor", time: "11:00 AM", status: "waiting" }
];
