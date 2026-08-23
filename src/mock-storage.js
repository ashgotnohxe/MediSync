// Mock implementation of the Anthropic window.storage for local development
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

// Seed data
export const DOCTORS = [
  { id: 1, name: "Dr. Rahul Verma", specialty: "General Physician", experience: "8 yrs", rating: 4.8 },
  { id: 2, name: "Dr. Sneha Kapoor", specialty: "Cardiologist", experience: "12 yrs", rating: 4.9 },
  { id: 3, name: "Dr. Amit Singh", specialty: "Neurologist", experience: "15 yrs", rating: 4.7 },
  { id: 4, name: "Dr. Priya Sharma", specialty: "Pediatrician", experience: "5 yrs", rating: 4.6 }
];

export const HOSPITALS_SEED = [
  { id: 1, name: "City Care Hospital", distance: "1.2 km away", type: "24x7 Emergency", categories: ["Cardiac", "Trauma", "General"], available: 14, total: 60 },
  { id: 2, name: "CareBridge Multispeciality", distance: "2.8 km away", type: "24x7 Emergency", categories: ["Cardiac", "Neuro"], available: 3, total: 40 },
  { id: 3, name: "Sunrise Children's Hospital", distance: "3.5 km away", type: "", categories: ["Pediatric"], available: 9, total: 30 }
];

export const PATIENTS_SEED = [
  { id: "p1", name: "Ravi Kumar", age: 34, bloodGroup: "O+", phone: "+91 9876543210" },
  { id: "p2", name: "Ayesha Khan", age: 28, bloodGroup: "A-", phone: "+91 9876543211" },
  { id: "p3", name: "Suresh Menon", age: 45, bloodGroup: "B+", phone: "+91 9876543212" }
];

// Initialize seeds if empty
(async () => {
  const currentPatients = await window.storage.get("patients_registry", true);
  if (!currentPatients) await window.storage.set("patients_registry", PATIENTS_SEED, true);
})();
