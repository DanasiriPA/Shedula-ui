import { useState, useEffect } from "react";

export default function Rating({ appointment }: { appointment?: any }) {
  const [rating, setRating] = useState(appointment?.rating || 0);

  useEffect(() => {
    if (appointment && appointment.rating) {
      setRating(appointment.rating);
    }
  }, [appointment]);

  const handleRate = (star: number) => {
    setRating(star);
    if (!appointment) return;
    const all = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updated = all.map((a: any) =>
      a.id === appointment.id ? { ...a, rating: star } : a
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    alert("Thank you for your rating!");
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <span>Rate this Doctor:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-500 cursor-pointer text-xl" : "text-gray-400 cursor-pointer text-xl"}
          onClick={() => handleRate(star)}
        >
          ★
        </span>
      ))}
    </div>  
    );
}