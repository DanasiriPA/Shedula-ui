const doctorFirstNames = [
  "Aarav", "Priya", "Rohan", "Meera", "Vikram", "Sneha", "Rahul", "Divya", "Karan", "Lakshmi", "Anil", "Ritu", "Nikhil", "Shalini"
];

const descriptions = [
  "Board-certified specialist with over 10 years of clinical experience. Expert in advanced diagnostics and patient care. Committed to delivering compassionate and personalized treatment.",
  "Renowned for precise diagnosis and effective therapies. Dedicated to continuous learning and medical research. Focused on building trust and long-term patient relationships.",
  "Experienced consultant with a strong background in multidisciplinary medicine. Skilled in handling complex cases and emergencies. Passionate about patient education and wellness.",
  "Award-winning practitioner recognized for excellence in healthcare. Proficient in modern medical technologies and procedures. Strives for the highest standards of safety and ethics.",
  "Trusted advisor for families and individuals. Known for empathetic communication and holistic care. Advocates preventive medicine and healthy lifestyle choices."
];

const maleImages = [
  "https://randomuser.me/api/portraits/men/10.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/men/65.jpg",
  "https://randomuser.me/api/portraits/men/23.jpg"
];

const femaleImages = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/women/29.jpg",
  "https://randomuser.me/api/portraits/women/56.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg"
];

const specialties = [
  "Gyno", "Neuro", "Skin", "Heart", "Child Specialist", "General", "Ortho", "Dental", "Eye", "Psychiatry", "Oncology", "Kidney", "Pulmonology", "Gastroenterology"
];

const generateDates = () => {
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
  return days;
};

const generateSlots = () => {
  const dates = generateDates();
  const sampleTimes = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM"];
  const slotMap: any = {};
  dates.forEach((d) => {
    slotMap[d] = sampleTimes.map((time) => ({
      time,
      available: Math.random() > 0.4
    }));
  });
  return slotMap;
};

const mockDoctors = specialties.flatMap((spec, idx) => {
  const base = {
    specialization: spec,
    location: "Chennai",
    description: descriptions[idx % descriptions.length],
    rating: `${(4.2 + (idx % 8) * 0.1).toFixed(1)}/5`,
    availableSlots: generateSlots(),
  };

  const available = {
    id: (idx * 2 + 1).toString(),
    name: `Dr. ${doctorFirstNames[idx]} Kumar`,
    age: 35 + (idx % 10),
    gender: "male",
    experience: 8 + (idx % 6),
    avatar: maleImages[idx % maleImages.length],
    available: true,
    ...base
  };

  const unavailable = {
    id: (idx * 2 + 2).toString(),
    name: `Dr. ${doctorFirstNames[idx]} Sharma`,
    age: 32 + (idx % 10),
    gender: "female",
    experience: 6 + (idx % 6),
    avatar: femaleImages[idx % femaleImages.length],
    available: false,
    ...base
  };

  return [available, unavailable];
});

export default mockDoctors;