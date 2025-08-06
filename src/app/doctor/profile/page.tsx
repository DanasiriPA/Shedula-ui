"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  FaUserCircle, FaEdit, FaSave, FaTimes, FaPhone, FaEnvelope, 
  FaMapMarkerAlt, FaBirthdayCake, FaIdCard, FaStethoscope,
  FaGraduationCap, FaCalendarAlt, FaBriefcaseMedical,
  FaClinicMedical, FaGlobe, FaLinkedin, FaTwitter, FaFacebook,
  FaInstagram, FaSignOutAlt, FaUserMd, FaChevronLeft, FaRupeeSign,
  FaPlus, FaFilePrescription
} from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  specialization: string;
  yearsOfExperience: number;
  qualifications: string[];
  medicalLicenseNumber: string;
  clinicName: string;
  clinicAddress: string;
  consultationFee: number;
  bio: string;
  languages: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  avatar: string;
}
import type { ImageProps } from 'next/image';

const SafeImage = ({ src, alt, ...props }: ImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const DEFAULT_AVATAR = 'https://i.postimg.cc/V6hR452b/download-1.jpg';

  return (
    <Image
      {...props}
      src={imgSrc || DEFAULT_AVATAR}
      alt={alt}
      onError={() => {
        setImgSrc(DEFAULT_AVATAR);
      }}
    />
  );
};

export default function DoctorProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [tempDoctor, setTempDoctor] = useState<DoctorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchDoctorProfile(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchDoctorProfile = async (userId: string) => {
    try {
      setLoading(true);
      // GET request to fetch doctor profile
      const response = await fetch(`https://json-server-7wzo.onrender.com/doctor/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const processedData = {
          ...data,
          qualifications: data.qualifications || [],
          languages: data.languages || [],
          socialMedia: data.socialMedia || {},
          avatar: data.avatar || 'https://i.postimg.cc/V6hR452b/download-1.jpg'
        };
        setDoctor(processedData);
        setTempDoctor(processedData);
      } else if (response.status === 404) {
        // Create default profile if not found
        const defaultProfile: DoctorProfile = {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
          dob: '1980-01-01',
          gender: 'Male',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Medical Street',
          city: 'Healthville',
          state: 'Wellness',
          country: 'USA',
          postalCode: '10001',
          specialization: 'Cardiology',
          yearsOfExperience: 10,
          qualifications: ['MD', 'PhD in Cardiology'],
          medicalLicenseNumber: 'MD123456',
          clinicName: 'Heart Care Center',
          clinicAddress: '456 Cardiology Lane, Healthville',
          consultationFee: 150,
          bio: 'Experienced cardiologist with specialization in interventional procedures.',
          languages: ['English', 'Spanish'],
          socialMedia: {
            linkedin: 'linkedin.com/in/johndoe',
            twitter: 'twitter.com/drjohndoe'
          },
          avatar: 'https://i.postimg.cc/V6hR452b/download-1.jpg'
        };
        
        // POST request to create new profile
        const createResponse = await fetch('https://json-server-7wzo.onrender.com/doctor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(defaultProfile),
        });
        
        if (createResponse.ok) {
          const createdProfile = await createResponse.json();
          setDoctor(createdProfile);
          setTempDoctor(createdProfile);
        } else {
          throw new Error(`Failed to create profile: ${await createResponse.text()}`);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      setError(error instanceof Error ? error.message : "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setTempDoctor(doctor);
    setError(null);
  };

  const handleSave = async () => {
  if (!user || !tempDoctor) return;
  
  try {
    setLoading(true);
    setError(null);
    
    // PATCH request to update doctor profile - include ID in URL
    const response = await fetch(`https://json-server-7wzo.onrender.com/doctor/${tempDoctor.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tempDoctor),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedProfile = await response.json();
    setDoctor(updatedProfile);
    setEditing(false);
  } catch (error) {
    console.error("Error updating profile:", error);
    setError(error instanceof Error ? error.message : 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempDoctor(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setTempDoctor(prev => {
      const currentArray = [...(prev![field as keyof DoctorProfile] as string[] || [])];
      currentArray[index] = value;
      return {
        ...prev!,
        [field]: currentArray
      };
    });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setTempDoctor(prev => ({
      ...prev!,
      socialMedia: {
        ...prev!.socialMedia,
        [platform]: value
      }
    }));
  };

  const addQualification = () => {
    setTempDoctor(prev => ({
      ...prev!,
      qualifications: [...(prev?.qualifications || []), '']
    }));
  };

  const removeQualification = (index: number) => {
    setTempDoctor(prev => ({
      ...prev!,
      qualifications: (prev?.qualifications || []).filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    setTempDoctor(prev => ({
      ...prev!,
      languages: [...(prev?.languages || []), '']
    }));
  };

  const removeLanguage = (index: number) => {
    setTempDoctor(prev => ({
      ...prev!,
      languages: (prev?.languages || []).filter((_, i) => i !== index)
    }));
  };

  if (loading && !doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl text-gray-700 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !doctor || !tempDoctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-inter relative overflow-x-hidden">
      <style jsx global>{`
        .bg-medical-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.4'%3E%3Cpath d='M20 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0-20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm40-40c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2zm0 20c0-1.105-0.895-2-2-2s-2 0.895-2 2s0.895 2 2 2s2-0.895 2-2z'/%3E%3Cpath d='M42 20h-4v-4h-4v4h-4v4h4v4h4v-4h4v-4z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px;
          opacity: 0.5;
        }
      `}</style>

      <div className="absolute inset-0 z-0 bg-white bg-medical-pattern"></div>

      {/* Header/Navbar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 py-5 px-8 flex justify-between items-center transition-all duration-300 rounded-b-3xl shadow-xl bg-white/90 backdrop-blur-md border-b-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-200 via-white to-purple-200`}
      >
        <div className="flex items-center gap-4">
          <SafeImage 
            src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg" 
            alt="Shedula Logo" 
            width={45} 
            height={45} 
            className="rounded-full shadow-md"
          />
          <motion.h1
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-lobster"
            style={{ fontFamily: "'Lobster', cursive" }}
            whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Shedula
          </motion.h1>
        </div>
        <div className="flex gap-8 text-gray-600 font-medium text-lg items-center">
          <motion.button
            onClick={() => router.push("/doctor/dashboard")}
            whileHover={{ y: -3, color: "#4F46E5" }}
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaStethoscope className="text-blue-600" /> Dashboard
          </motion.button>
          <motion.button 
            onClick={() => router.push("/doctor/appointments")} 
            whileHover={{ y: -3, color: "#4F46E5" }} 
            className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaCalendarAlt className="text-blue-600" /> Appointments
          </motion.button>
          <motion.button 
                      onClick={() => router.push("/doctor/prescriptions")} 
                      whileHover={{ y: -3, color: "#4F46E5" }} 
                      className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700"
                    >
                      <FaFilePrescription className="text-blue-600" /> Prescriptions
                    </motion.button>
          <motion.button onClick={() => router.push("/doctor/patients")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <FaUserMd className="text-blue-600" /> Patients
          </motion.button>
          <motion.button onClick={() => router.push("/doctor/profile")} whileHover={{ y: -3, color: "#4F46E5" }} className="transition-all flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 bg-blue-50 text-blue-700">
            <FaUserCircle className="text-blue-600" /> Profile
          </motion.button>
        </div>
        <motion.button
          onClick={() => auth.signOut().then(() => router.push('/'))}
          className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaSignOutAlt className="text-xl" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 pt-28 px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-3 rounded-xl bg-blue-100 font-semibold"
          >
            <FaChevronLeft /> Back
          </button>
          
          {editing ? (
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-green-400"
              >
                {loading ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <FaSave />
                )}
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded">
            <p>{error}</p>
          </div>
        )}

        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Doctor Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {tempDoctor.avatar ? (
                  <SafeImage 
                    src={tempDoctor.avatar} 
                    alt="Doctor Avatar" 
                    width={150} 
                    height={150} 
                    className="rounded-full border-4 border-blue-200"
                    priority
                  />
                ) : (
                  <div className="w-[150px] h-[150px] rounded-full border-4 border-blue-200 bg-gray-200 flex items-center justify-center">
                    <FaUserCircle className="text-gray-400 text-6xl" />
                  </div>
                )}
                {editing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <FaEdit />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-bold text-center">
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="firstName"
                      value={tempDoctor.firstName}
                      onChange={handleChange}
                      className="border-b border-gray-300 px-2 py-1 text-center"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={tempDoctor.lastName}
                      onChange={handleChange}
                      className="border-b border-gray-300 px-2 py-1 text-center"
                    />
                  </div>
                ) : (
                  `${doctor.firstName} ${doctor.lastName}`
                )}
              </h2>
              <p className="text-blue-600 font-medium">
                {editing ? (
                  <input
                    type="text"
                    name="specialization"
                    value={tempDoctor.specialization}
                    onChange={handleChange}
                    className="border-b border-gray-300 px-2 py-1 text-center"
                  />
                ) : (
                  doctor.specialization
                )}
              </p>
              <div className="mt-4 flex gap-4">
                {(tempDoctor.socialMedia ? Object.entries(tempDoctor.socialMedia) : []).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform} 
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {platform === 'linkedin' && <FaLinkedin size={20} />}
                      {platform === 'twitter' && <FaTwitter size={20} />}
                      {platform === 'facebook' && <FaFacebook size={20} />}
                      {platform === 'instagram' && <FaInstagram size={20} />}
                    </a>
                  )
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <FaIdCard className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Medical License</p>
                  {editing ? (
                    <input
                      type="text"
                      name="medicalLicenseNumber"
                      value={tempDoctor.medicalLicenseNumber}
                      onChange={handleChange}
                      className="border-b border-gray-300 px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{doctor.medicalLicenseNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaBriefcaseMedical className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  {editing ? (
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={tempDoctor.yearsOfExperience}
                      onChange={handleChange}
                      className="border-b border-gray-300 px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{doctor.yearsOfExperience} years</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaRupeeSign className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  {editing ? (
                    <input
                      type="number"
                      name="consultationFee"
                      value={tempDoctor.consultationFee}
                      onChange={handleChange}
                      className="border-b border-gray-300 px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">₹{doctor.consultationFee}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaUserCircle className="text-blue-500" /> Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    name="dob"
                    value={tempDoctor.dob}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <FaBirthdayCake className="text-blue-500" /> {new Date(doctor.dob).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Gender</label>
                {editing ? (
                  <select
                    name="gender"
                    value={tempDoctor.gender}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="font-medium">{doctor.gender}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={tempDoctor.email}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" /> {doctor.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={tempDoctor.phone}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <FaPhone className="text-blue-500" /> {doctor.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Address</label>
                {editing ? (
                  <textarea
                    name="address"
                    value={tempDoctor.address}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    rows={3}
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" /> {doctor.address}
                  </p>
                )}
              </div>
              {editing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={tempDoctor.city}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={tempDoctor.state}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={tempDoctor.country}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={tempDoctor.postalCode}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaUserMd className="text-blue-500" /> Professional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Clinic Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="clinicName"
                    value={tempDoctor.clinicName}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <FaClinicMedical className="text-blue-500" /> {doctor.clinicName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Clinic Address</label>
                {editing ? (
                  <textarea
                    name="clinicAddress"
                    value={tempDoctor.clinicAddress}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    rows={3}
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" /> {doctor.clinicAddress}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Qualifications</label>
                {editing ? (
                  <div className="space-y-2">
                    {(tempDoctor.qualifications || []).map((qual, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={qual}
                          onChange={(e) => handleArrayChange('qualifications', index, e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 flex-grow"
                        />
                        <button
                          onClick={() => removeQualification(index)}
                          className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addQualification}
                      className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaPlus /> Add Qualification
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {(doctor.qualifications || []).map((qual, index) => (
                      <li key={index} className="font-medium flex items-center gap-2">
                        <FaGraduationCap className="text-blue-500" /> {qual}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Languages Spoken</label>
                {editing ? (
                  <div className="space-y-2">
                    {(tempDoctor.languages || []).map((lang, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={lang}
                          onChange={(e) => handleArrayChange('languages', index, e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 flex-grow"
                        />
                        <button
                          onClick={() => removeLanguage(index)}
                          className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addLanguage}
                      className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaPlus /> Add Language
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {(doctor.languages || []).map((lang, index) => (
                      <li key={index} className="font-medium flex items-center gap-2">
                        <FaGlobe className="text-blue-500" /> {lang}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Bio</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={tempDoctor.bio}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    rows={4}
                  />
                ) : (
                  <p className="font-medium">{doctor.bio}</p>
                )}
              </div>
              {editing && (
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Social Media</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaLinkedin className="text-blue-700" />
                      <input
                        type="text"
                        placeholder="LinkedIn URL"
                        value={tempDoctor.socialMedia.linkedin || ''}
                        onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTwitter className="text-blue-400" />
                      <input
                        type="text"
                        placeholder="Twitter URL"
                        value={tempDoctor.socialMedia.twitter || ''}
                        onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaFacebook className="text-blue-600" />
                      <input
                        type="text"
                        placeholder="Facebook URL"
                        value={tempDoctor.socialMedia.facebook || ''}
                        onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaInstagram className="text-pink-600" />
                      <input
                        type="text"
                        placeholder="Instagram URL"
                        value={tempDoctor.socialMedia.instagram || ''}
                        onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12 px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold font-lobster mb-4" style={{ fontFamily: "'Lobster', cursive" }}>Shedula</h3>
            <p className="text-gray-300 text-sm">Your all-in-one healthcare platform for booking appointments, consulting online, and managing health records.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Appointments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Patients</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Profile</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2"><FaMapMarkerAlt /> 123 Health Ave, Wellness City, 10001</p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2"><FaBriefcaseMedical /> contact@shedula.com</p>
            <p className="text-gray-300 text-sm flex items-center gap-2 mb-2"><FaCalendarAlt /> +91 98765 43210</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Shedula. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}