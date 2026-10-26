// Mock implementation of window.storage for local development & localStorage sync
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

// Doctors Seed Data (Standardized consistent ratings across all pages)
export const DOCTORS = [
  { id: 1, name: "Dr. Ananya Rao", specialty: "Cardiologist", experience: "12 yrs", rating: 4.9, price: 200 },
  { id: 2, name: "Dr. Vikram Sen", specialty: "General Physician", experience: "8 yrs", rating: 4.7, price: 150 },
  { id: 3, name: "Dr. Meera Iyer", specialty: "Pediatrician", experience: "10 yrs", rating: 4.8, price: 180 },
  { id: 4, name: "Dr. Farhan Ali", specialty: "Neurologist", experience: "15 yrs", rating: 4.6, price: 250 },
  { id: 5, name: "Dr. Kavita Joshi", specialty: "General Physician", experience: "9 yrs", rating: 4.9, price: 150 },
  { id: 6, name: "Dr. Rohan Das", specialty: "Orthopedic", experience: "7 yrs", rating: 4.5, price: 180 },
  { id: 7, name: "Dr. Priya Nair", specialty: "Dermatologist", experience: "11 yrs", rating: 4.8, price: 220 },
  { id: 8, name: "Dr. Sanjay Mehta", specialty: "Cardiologist", experience: "14 yrs", rating: 4.6, price: 240 },
  { id: 9, name: "Dr. Neha Kapoor", specialty: "Gynecologist", experience: "10 yrs", rating: 4.8, price: 200 },
  { id: 10, name: "Dr. Arjun Singh", specialty: "ENT Specialist", experience: "6 yrs", rating: 4.7, price: 160 }
];

// Hospitals Seed Data for Hospital Bed Availability
export const HOSPITALS_SEED = [
  { id: 1, name: "City Care Hospital", distance: "1.2 km away", type: "24x7 Emergency", categories: ["Cardiac", "Trauma", "General"], available: 14, total: 60 },
  { id: 2, name: "CareBridge Multispeciality", distance: "2.8 km away", type: "24x7 Emergency", categories: ["Cardiac", "Neuro"], available: 3, total: 40 },
  { id: 3, name: "Sunrise Children's Hospital", distance: "3.5 km away", type: "Children & Maternity", categories: ["Pediatric"], available: 9, total: 30 }
];

// Patients Seed Data
export const PATIENTS_SEED = [
  { id: "p1", name: "Ravi Kumar", age: 34, bloodGroup: "O+", phone: "+91 9876543210" },
  { id: "p2", name: "Ayesha Khan", age: 28, bloodGroup: "A-", phone: "+91 9876543211" },
  { id: "p3", name: "Suresh Menon", age: 45, bloodGroup: "B+", phone: "+91 9876543212" }
];

// Queue Seed Data for appointments
export const QUEUE_SEED = [
  { id: 1, patientName: "Rahul Verma", time: "10:30 AM", status: "waiting" },
  { id: 2, patientName: "Sneha Kapoor", time: "11:00 AM", status: "waiting" },
  { id: 3, patientName: "Aditi Sharma", time: "9:15 AM", status: "done" }
];
