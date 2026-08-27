// Storage helper supporting browser localStorage & Anthropic window.storage compatibility
window.storage = {
  data: {},
  async get(key, shared) {
    const fullKey = shared ? `shared_${key}` : `local_${key}`;
    const stored = localStorage.getItem(fullKey) || localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },
  async set(key, value, shared) {
    const fullKey = shared ? `shared_${key}` : `local_${key}`;
    localStorage.setItem(fullKey, JSON.stringify(value));
    if (shared) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  async delete(key, shared) {
    const fullKey = shared ? `shared_${key}` : `local_${key}`;
    localStorage.removeItem(fullKey);
    localStorage.removeItem(key);
  }
};

export const loadData = async (key, shared, fallback) => {
  const data = await window.storage.get(key, shared);
  return data !== null ? data : fallback;
};

export const saveData = async (key, value, shared) => {
  await window.storage.set(key, value, shared);
};

export const DOCTORS = [
  { id: 1, name: "Dr. Ananya Rao", specialty: "General Physician", experience: "8 yrs", rating: 4.8, price: 150 },
  { id: 2, name: "Dr. Vikram Sen", specialty: "Cardiologist", experience: "12 yrs", rating: 4.9, price: 200 },
  { id: 3, name: "Dr. Meera Iyer", specialty: "Pediatrician", experience: "9 yrs", rating: 4.7, price: 160 },
  { id: 4, name: "Dr. Farhan Ali", specialty: "Dermatologist", experience: "7 yrs", rating: 4.6, price: 180 },
  { id: 5, name: "Dr. Kavita Joshi", specialty: "Orthopedic", experience: "14 yrs", rating: 4.9, price: 220 },
  { id: 6, name: "Dr. Rohan Das", specialty: "Gynecologist", experience: "10 yrs", rating: 4.8, price: 190 },
  { id: 7, name: "Dr. Priya Nair", specialty: "ENT Specialist", experience: "6 yrs", rating: 4.5, price: 150 },
  { id: 8, name: "Dr. Sanjay Mehta", specialty: "Neurologist", experience: "15 yrs", rating: 4.9, price: 250 },
  { id: 9, name: "Dr. Neha Kapoor", specialty: "General Physician", experience: "5 yrs", rating: 4.6, price: 150 },
  { id: 10, name: "Dr. Arjun Singh", specialty: "Cardiologist", experience: "11 yrs", rating: 4.8, price: 210 }
];

export const HOSPITALS_SEED = [
  { id: 1, name: "City Care Hospital", distance: "1.2 km away", type: "24x7 Emergency", categories: ["Cardiac", "Trauma", "General"], available: 14, total: 60, beds: 14, totalBeds: 60 },
  { id: 2, name: "CareBridge Multispeciality", distance: "2.8 km away", type: "24x7 Emergency", categories: ["Cardiac", "Neuro"], available: 3, total: 40, beds: 3, totalBeds: 40 },
  { id: 3, name: "Sunrise Children's Hospital", distance: "3.5 km away", type: "Pediatric Care", categories: ["Pediatric", "General"], available: 9, total: 30, beds: 9, totalBeds: 30 },
  { id: 4, name: "Apollo Clinic & Trauma", distance: "4.1 km away", type: "24x7 Emergency", categories: ["Trauma", "Orthopedic"], available: 11, total: 25, beds: 11, totalBeds: 25 }
];

export const QUEUE_SEED = [
  { id: 1, patientName: "Rahul Verma", patient: "Rahul Verma", doctor: "Ananya Rao", time: "10:30 AM", slot: "10:30 AM", status: "waiting", bookedAt: Date.now() - 3600000 },
  { id: 2, patientName: "Sneha Kapoor", patient: "Sneha Kapoor", doctor: "Farhan Ali", time: "11:00 AM", slot: "11:00 AM", status: "waiting", bookedAt: Date.now() - 1800000 },
  { id: 3, patientName: "Aditi Sharma", patient: "Aditi Sharma", doctor: "Vikram Sen", time: "9:15 AM", slot: "9:15 AM", status: "done", bookedAt: Date.now() - 7200000 },
];

export const PATIENTS_SEED = [
  { id: "p1", name: "Ravi Kumar", age: 34, bloodGroup: "O+", phone: "+91 9876543210" },
  { id: "p2", name: "Ayesha Khan", age: 28, bloodGroup: "A-", phone: "+91 9876543211" },
  { id: "p3", name: "Suresh Menon", age: 45, bloodGroup: "B+", phone: "+91 9876543212" },
  { id: "p4", name: "Rahul Verma", age: 29, bloodGroup: "B+", phone: "+91 9876543213" },
  { id: "p5", name: "Sneha Kapoor", age: 31, bloodGroup: "AB+", phone: "+91 9876543214" }
];

// Initialize seeds if not present
(async () => {
  const currentPatients = await window.storage.get("patients_registry", true);
  if (!currentPatients || currentPatients.length === 0) {
    await window.storage.set("patients_registry", PATIENTS_SEED, true);
  }

  const currentBeds = await window.storage.get("beds", true);
  if (!currentBeds || currentBeds.length === 0) {
    await window.storage.set("beds", HOSPITALS_SEED, true);
  }

  const currentQueue = await window.storage.get("queue", true);
  if (!currentQueue || currentQueue.length === 0) {
    await window.storage.set("queue", QUEUE_SEED, true);
  }
})();
