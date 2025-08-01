// lib/medicineData.ts
import { Medicine } from '@/types';

export const medicineCategories = [
  "Pain Relief",
  "Antibiotics",
  "Vitamins & Supplements",
  "Cough & Cold",
  "Digestion",
  "Allergy",
  "Skin Care",
  "Cardiology",
  "Diabetic Care",
  "Pediatrics"
];

const mockMedicines: Medicine[] = [
  {
    id: "M001",
    name: "Paracetamol",
    firstLetterId: "P",
    category: "Pain Relief",
    initialQuantity: 100,
    pricePerUnit: 2.50,
    description: "Common pain reliever and fever reducer."
  },
  {
    id: "M002",
    name: "Ibuprofen",
    firstLetterId: "I",
    category: "Pain Relief",
    initialQuantity: 75,
    pricePerUnit: 3.00,
    description: "Nonsteroidal anti-inflammatory drug (NSAID) for pain and inflammation."
  },
  {
    id: "M003",
    name: "Aspirin",
    firstLetterId: "A",
    category: "Pain Relief",
    initialQuantity: 50,
    pricePerUnit: 1.50,
    description: "Used for pain, fever, and inflammation, also as a blood thinner."
  },
  {
    id: "M004",
    name: "Amoxicillin",
    firstLetterId: "A",
    category: "Antibiotics",
    initialQuantity: 40,
    pricePerUnit: 15.00,
    description: "Broad-spectrum penicillin antibiotic."
  },
  {
    id: "M005",
    name: "Azithromycin",
    firstLetterId: "A",
    category: "Antibiotics",
    initialQuantity: 30,
    pricePerUnit: 20.00,
    description: "Macrolide antibiotic used for bacterial infections."
  },
  {
    id: "M006",
    name: "Ciprofloxacin",
    firstLetterId: "C",
    category: "Antibiotics",
    initialQuantity: 25,
    pricePerUnit: 18.00,
    description: "Fluoroquinolone antibiotic for various bacterial infections."
  },
  {
    id: "M007",
    name: "Multivitamin",
    firstLetterId: "M",
    category: "Vitamins & Supplements",
    initialQuantity: 120,
    pricePerUnit: 8.00,
    description: "Daily supplement with essential vitamins and minerals."
  },
  {
    id: "M008",
    name: "Vitamin D3",
    firstLetterId: "V",
    category: "Vitamins & Supplements",
    initialQuantity: 90,
    pricePerUnit: 10.00,
    description: "Important for bone health and immune function."
  },
  {
    id: "M009",
    name: "Omega-3 Fish Oil",
    firstLetterId: "O",
    category: "Vitamins & Supplements",
    initialQuantity: 60,
    pricePerUnit: 25.00,
    description: "Supports heart and brain health."
  },
  {
    id: "M010",
    name: "Cough Syrup",
    firstLetterId: "C",
    category: "Cough & Cold",
    initialQuantity: 80,
    pricePerUnit: 7.50,
    description: "Relieves cough and cold symptoms."
  },
  {
    id: "M011",
    name: "Decongestant",
    firstLetterId: "D",
    category: "Cough & Cold",
    initialQuantity: 50,
    pricePerUnit: 6.00,
    description: "Helps clear nasal passages."
  },
  {
    id: "M012",
    name: "Sore Throat Lozenges",
    firstLetterId: "S",
    category: "Cough & Cold",
    initialQuantity: 150,
    pricePerUnit: 0.75,
    description: "Soothes sore throats."
  },
  {
    id: "M013",
    name: "Antacid",
    firstLetterId: "A",
    category: "Digestion",
    initialQuantity: 100,
    pricePerUnit: 4.00,
    description: "Relieves heartburn and indigestion."
  },
  {
    id: "M014",
    name: "Laxative",
    firstLetterId: "L",
    category: "Digestion",
    initialQuantity: 30,
    pricePerUnit: 9.00,
    description: "For relief of occasional constipation."
  },
  {
    id: "M015",
    name: "Probiotic",
    firstLetterId: "P",
    category: "Digestion",
    initialQuantity: 60,
    pricePerUnit: 22.00,
    description: "Supports gut health and digestion."
  },
  {
    id: "M016",
    name: "Antihistamine",
    firstLetterId: "A",
    category: "Allergy",
    initialQuantity: 70,
    pricePerUnit: 5.50,
    description: "Relieves allergy symptoms like sneezing and itching."
  },
  {
    id: "M017",
    name: "Nasal Spray",
    firstLetterId: "N",
    category: "Allergy",
    initialQuantity: 45,
    pricePerUnit: 12.00,
    description: "Provides relief from nasal congestion due to allergies."
  },
  {
    id: "M018",
    name: "Eye Drops",
    firstLetterId: "E",
    category: "Allergy",
    initialQuantity: 60,
    pricePerUnit: 8.00,
    description: "Relieves itchy, watery eyes from allergies."
  },
  {
    id: "M019",
    name: "Moisturizer",
    firstLetterId: "M",
    category: "Skin Care",
    initialQuantity: 100,
    pricePerUnit: 15.00,
    description: "Hydrates and protects skin."
  },
  {
    id: "M020",
    name: "Antifungal Cream",
    firstLetterId: "A",
    category: "Skin Care",
    initialQuantity: 40,
    pricePerUnit: 10.00,
    description: "Treats fungal skin infections."
  },
  {
    id: "M021",
    name: "Sunscreen",
    firstLetterId: "S",
    category: "Skin Care",
    initialQuantity: 70,
    pricePerUnit: 18.00,
    description: "Protects skin from harmful UV rays."
  },
  {
    id: "M022",
    name: "Amlodipine",
    firstLetterId: "A",
    category: "Cardiology",
    initialQuantity: 50,
    pricePerUnit: 20.00,
    description: "Treats high blood pressure and chest pain (angina)."
  },
  {
    id: "M023",
    name: "Atorvastatin",
    firstLetterId: "A",
    category: "Cardiology",
    initialQuantity: 60,
    pricePerUnit: 25.00,
    description: "Lowers high cholesterol and triglyceride levels."
  },
  {
    id: "M024",
    name: "Metoprolol",
    firstLetterId: "M",
    category: "Cardiology",
    initialQuantity: 45,
    pricePerUnit: 17.00,
    description: "Beta-blocker used to treat high blood pressure, angina, and heart failure."
  },
  {
    id: "M025",
    name: "Metformin",
    firstLetterId: "M",
    category: "Diabetic Care",
    initialQuantity: 80,
    pricePerUnit: 12.00,
    description: "Oral medication for managing type 2 diabetes."
  },
  {
    id: "M026",
    name: "Insulin Pen",
    firstLetterId: "I",
    category: "Diabetic Care",
    initialQuantity: 20,
    pricePerUnit: 50.00,
    description: "Injectable insulin for blood sugar control."
  },
  {
    id: "M027",
    name: "Glucose Test Strips",
    firstLetterId: "G",
    category: "Diabetic Care",
    initialQuantity: 100,
    pricePerUnit: 0.50,
    description: "For monitoring blood glucose levels."
  },
  {
    id: "M028",
    name: "Pediatric Cough Syrup",
    firstLetterId: "P",
    category: "Pediatrics",
    initialQuantity: 60,
    pricePerUnit: 9.00,
    description: "Gentle cough relief for children."
  },
  {
    id: "M029",
    name: "Baby Multivitamin Drops",
    firstLetterId: "B",
    category: "Pediatrics",
    initialQuantity: 50,
    pricePerUnit: 11.00,
    description: "Liquid multivitamin for infants and toddlers."
  },
  {
    id: "M030",
    name: "Diaper Rash Cream",
    firstLetterId: "D",
    category: "Pediatrics",
    initialQuantity: 70,
    pricePerUnit: 7.00,
    description: "Soothes and prevents diaper rash."
  }
];

export default mockMedicines;