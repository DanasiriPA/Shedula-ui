"use client";

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // ✅ Import Next.js Image component

interface FormData {
  name: string;
  age: string;
  gender: string;
  location: string;
  email: string;
  phone: string;
  dob: string;
  bloodGroup: string;
  lifestyle: string;
  dietary: string;
  wellnessGoals: string;
  insuranceProvider: string;
  policyNumber: string;
  idProof: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  reminders: boolean;
  emailUpdates: boolean;
}

const PatientProfilePage = () => {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const initialFormState: FormData = {
    name: '',
    age: '',
    gender: '',
    location: '',
    email: '',
    phone: '',
    dob: '',
    bloodGroup: '',
    lifestyle: '',
    dietary: '',
    wellnessGoals: '',
    insuranceProvider: '',
    policyNumber: '',
    idProof: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    reminders: false,
    emailUpdates: false,
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const fetchPatient = async () => {
      try {
        const res = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin/1");
        const data = await res.json();
        setFormData({
          name: data.name || '',
          age: data.age || '',
          gender: data.gender || '',
          location: data.location || '',
          email: data.patientemail || '',
          phone: data.phonenumber || '',
          dob: data.dateofbirth || '',
          bloodGroup: data.bloodgroup || '',
          lifestyle: data.lifestylechoices || '',
          dietary: data.dieterypreferences || '',
          wellnessGoals: data.wellnessgoals || '',
          insuranceProvider: data.insuranceprovider || '',
          policyNumber: data.policynumber || '',
          idProof: data.governmentID || '',
          emergencyName: data.contactname || '',
          emergencyRelation: data.relation || '',
          emergencyPhone: data.contactnumber || '',
          reminders: false,
          emailUpdates: false,
        });
      } catch (err) {
        console.error("Error fetching patient:", err);
      }
    };

    fetchPatient();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => router.push('/');
  const toggleEdit = () => setIsEditing((prev) => !prev);
  const handleClear = () => setFormData(initialFormState);
  const handleBack = () => router.back();

  const savePatientData = async () => {
    try {
      const response = await fetch("https://6888ba66adf0e59551bb2689.mockapi.io/v1/patientlogin/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          location: formData.location,
          patientemail: formData.email,
          phonenumber: formData.phone,
          dateofbirth: formData.dob,
          bloodgroup: formData.bloodGroup,
          lifestylechoices: formData.lifestyle,
          dieterypreferences: formData.dietary,
          wellnessgoals: formData.wellnessGoals,
          insuranceprovider: formData.insuranceProvider,
          policynumber: formData.policyNumber,
          governmentID: formData.idProof,
          contactname: formData.emergencyName,
          relation: formData.emergencyRelation,
          contactnumber: formData.emergencyPhone,
        }),
      });

      if (response.ok) {
        alert("Patient data updated!");
        setIsEditing(false);
      } else {
        alert("Failed to update data.");
      }
    } catch (error) {
      console.error("Error updating patient data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-8 space-y-6">
        <button onClick={handleBack} className="text-blue-600 hover:underline mb-4">← Back</button>

        <div className="flex flex-col items-center space-y-2 mb-6">
          <Image
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
            alt="Shedula Logo"
            width={64}
            height={64}
            className="rounded-full"
            unoptimized
          />
          <h2 className="text-3xl text-blue-700" style={{ fontFamily: "'Lobster', cursive" }}>Shedula</h2>
          <p className="text-sm text-gray-600 italic">Your health, your records, your control</p>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800">👤 Patient Profile</h1>

        <div className="flex justify-end space-x-4">
          <button
            onClick={isEditing ? savePatientData : toggleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isEditing ? 'Save & View' : 'Edit Info'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Clear
          </button>
        </div>

        {isEditing ? (
          <form className="space-y-6">
            <Section title="Basic Info">
              <InputGrid>
                <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
                <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
                <Input label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
                <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
              </InputGrid>
            </Section>

            <Section title="Health Preferences">
              <InputGrid>
                <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                <Input label="Lifestyle Choices" name="lifestyle" value={formData.lifestyle} onChange={handleChange} />
                <Input label="Dietary Preferences" name="dietary" value={formData.dietary} onChange={handleChange} />
                <Input label="Wellness Goals" name="wellnessGoals" value={formData.wellnessGoals} onChange={handleChange} />
              </InputGrid>
            </Section>

            <Section title="Insurance & ID">
              <InputGrid>
                <Input label="Insurance Provider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} />
                <Input label="Policy Number" name="policyNumber" value={formData.policyNumber} onChange={handleChange} />
                <Input label="Government ID" name="idProof" value={formData.idProof} onChange={handleChange} />
              </InputGrid>
            </Section>

            <Section title="Emergency Contact">
              <InputGrid>
                <Input label="Contact Name" name="emergencyName" value={formData.emergencyName} onChange={handleChange} />
                <Input label="Relation" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} />
                                <Input label="Phone" name="emergencyPhone" type="tel" value={formData.emergencyPhone} onChange={handleChange} />
              </InputGrid>
            </Section>

            <Section title="Notifications & Settings">
              <div className="space-y-2">
                <Checkbox
                  label="Appointment Reminders"
                  name="reminders"
                  checked={formData.reminders}
                  onChange={handleChange}
                />
                <Checkbox
                  label="Email Updates"
                  name="emailUpdates"
                  checked={formData.emailUpdates}
                  onChange={handleChange}
                />
              </div>
            </Section>
          </form>
        ) : (
          <div className="space-y-4 text-gray-800">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b py-2">
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Logout Button */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
            <p className="text-lg font-semibold text-gray-800">Are you sure you want to log out?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    {children}
  </div>
);

interface InputGridProps {
  children: ReactNode;
}

const InputGrid = ({ children }: InputGridProps) => (
  <div className="grid grid-cols-2 gap-4">{children}</div>
);

interface InputProps {
  label: string;
  name: keyof FormData;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ label, name, type = 'text', value, onChange }: InputProps) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
    />
  </div>
);

interface CheckboxProps {
  label: string;
  name: keyof FormData;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ label, name, checked, onChange }: CheckboxProps) => (
  <label className="flex items-center space-x-2 text-gray-700">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="form-checkbox h-4 w-4 text-blue-600"
    />
    <span>{label}</span>
  </label>
);

export default PatientProfilePage;