// lib/mockDoctors.ts

export type Slot = {
  time: string;
  available: boolean;
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  education: string;
  avatar: string;
  experience: number;
  location: string;
  rating: string;
  available: boolean;
  description: string;
  clinicPrice: number;
  onlinePrice: number;
  availableSlots: {
    online: Record<string, Slot[]>;
    clinic: Record<string, Slot[]>;
  };
};

const generateSlots = (numDays: number): Record<string, Slot[]> => {
  const slots: Record<string, Slot[]> = {};
  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];

    const daySlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      daySlots.push({ time: `${hour}:00`, available: Math.random() > 0.3 });
      daySlots.push({ time: `${hour}:30`, available: Math.random() > 0.3 });
    }
    slots[dateString] = daySlots;
  }
  return slots;
};

const generateMockDoctors = (): Doctor[] => {
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];
  const specializations = [
    { name: "Gyno", education: "MBBS, MS (Obs & Gyn)", emoji: "👩‍⚕️" },
    { name: "Neuro", education: "MD, DM (Neurology)", emoji: "🧠" },
    { name: "Skin", education: "MBBS, MD (Dermatology)", emoji: "🧴" },
    { name: "Heart", education: "MD, DM (Cardiology)", emoji: "❤️" },
    { name: "Child Specialist", education: "MBBS, DCH", emoji: "🧒" },
    { name: "General", education: "MBBS, MD (General Medicine)", emoji: "🩺" },
    { name: "Ortho", education: "MBBS, MS (Orthopaedics)", emoji: "🦴" },
    { name: "Dental", education: "BDS, MDS (Orthodontics)", emoji: "🦷" },
    { name: "Psychiatry", education: "MD (Psychiatry)", emoji: "🧘" },
    { name: "Oncology", education: "MD, DM (Oncology)", emoji: "🎗️" },
  ];

  const indianNames = [
    "Aarav Sharma", "Ananya Singh", "Rohan Verma", "Diya Gupta", "Kabir Patel", "Ishani Reddy", "Vikram Joshi", "Meera Desai",
    "Arjun Mishra", "Pooja Kumar", "Siddharth Rao", "Janhvi Sharma", "Rahul Singh", "Neha Verma", "Vivek Patel", "Sana Khan",
    "Gaurav Reddy", "Anjali Jain", "Yash Chopra", "Tanya Agarwal", "Kunal Tiwari", "Shruti Gupta", "Aditya Sharma", "Nisha Das",
  ];
  
  const avatarImages = [
    "https://i.postimg.cc/V6hR452b/download-1.jpg", "https://i.postimg.cc/HxnzQbvg/download-2.jpg", "https://i.postimg.cc/bv3LDmTg/download-3.jpg",
    "https://i.postimg.cc/BvqMnrxt/download-4.jpg", "https://i.postimg.cc/mg3mRL10/download-5.jpg", "https://i.postimg.cc/Sxbgw2R6/images.jpg",
    "https://i.postimg.cc/4N98Lbf4/images-1.jpg", "https://i.postimg.cc/qMPF4DbC/images-10.jpg", "https://i.postimg.cc/DyJDV3gT/images-11.jpg",
    "https://i.postimg.cc/5yjrNhW8/images-12.jpg", "https://i.postimg.cc/1RYTY3DB/images-13.jpg", "https://i.postimg.cc/KjVHK0mw/images-14.jpg",
    "https://i.postimg.cc/7PcsnQyQ/images-2.jpg", "https://i.postimg.cc/SRwgQjrp/images-3.jpg", "https://i.postimg.cc/PJL6k114/images-4.jpg",
    "https://i.postimg.cc/V6Z7TK0v/images-5.jpg", "https://i.postimg.cc/rpJZGV8S/images-6.jpg", "https://i.postimg.cc/j5SgZp5B/images-7.jpg",
    "https://i.postimg.cc/hGg37zqD/images-8.jpg", "https://i.postimg.cc/8zL05d9X/images-9.jpg",
  ];

  const mockDoctors: Doctor[] = [];
  let id = 1;

  for (let i = 0; i < 70; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const spec = specializations[Math.floor(Math.random() * specializations.length)];
    const name = indianNames[Math.floor(Math.random() * indianNames.length)]; // Corrected: Randomly select a name
    const avatar = avatarImages[Math.floor(Math.random() * avatarImages.length)]; // Corrected: Randomly select an avatar
    
    mockDoctors.push({
      id: (id++).toString(),
      name: `Dr. ${name}`,
      specialization: spec.name,
      education: spec.education,
      avatar: avatar,
      experience: 3 + Math.floor(Math.random() * 25),
      location: city,
      rating: (4.0 + Math.random() * 1.0).toFixed(1),
      available: Math.random() > 0.2,
      description: `Dr. ${name.split(" ")[0]} is a highly dedicated and compassionate healthcare professional specializing in ${spec.name.toLowerCase()}. With a focus on patient well-being, they offer personalized care and advanced treatment options. Committed to excellence and continuous learning in the field of ${spec.name.toLowerCase()} health.`,
      clinicPrice: Math.floor(Math.random() * 500) + 500,
      onlinePrice: Math.floor(Math.random() * 300) + 200,
      availableSlots: {
        clinic: generateSlots(7),
        online: generateSlots(7),
      },
    });
  }
  return mockDoctors;
};

export default generateMockDoctors();