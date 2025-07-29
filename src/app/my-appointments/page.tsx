"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppointmentDetails from "@/app/my-appointments/components/AppointmentDetails";
import RescheduleModal from "@/app/my-appointments/components/RescheduleModal";
import CancelModal from "@/app/my-appointments/components/CancelModal";
import Rating from "@/app/my-appointments/components/Rating";
import NotesSection from "@/app/my-appointments/components/NotesSection";

// Helper to parse time string into hours and minutes
function parseTimeString(time: string): { hour: number; minute: number } {
  let hour = 0;
  let minute = 0;

  const cleaned = time.trim().toLowerCase().replace(/[^0-9:apm]/g, "");
  const isPM = cleaned.includes("pm");
  const isAM = cleaned.includes("am");

  const parts = cleaned.replace(/am|pm/, "").split(":");
  hour = parseInt(parts[0]);
  minute = parts[1] ? parseInt(parts[1]) : 0;

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return { hour, minute };
}

// Helper to calculate time remaining
function getTimeRemaining(date: string, time: string): string {
  const { hour, minute } = parseTimeString(time);
  const apptDateTime = new Date(date);
  apptDateTime.setHours(hour);
  apptDateTime.setMinutes(minute);
  apptDateTime.setSeconds(0);

  const now = new Date();
  const diffMs = apptDateTime.getTime() - now.getTime();

  if (diffMs <= 0) return "Started or passed";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""} remaining`;
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showVisited, setShowVisited] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("appointments");
    if (stored) {
      const allAppointments = JSON.parse(stored);
      const now = new Date();

      const updatedAppointments = allAppointments.map((appt: any) => {
        const { hour, minute } = parseTimeString(appt.time);
        const apptDateTime = new Date(appt.date);
        apptDateTime.setHours(hour);
        apptDateTime.setMinutes(minute);
        apptDateTime.setSeconds(0);

        const diffMs = now.getTime() - apptDateTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (appt.status === "upcoming" && diffHours >= 1) {
          return { ...appt, status: "visited" };
        }
        return appt;
      });

      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
    }
  }, []);

  const handleReschedule = (appt: any) => {
    setSelectedAppt(appt);
    setShowRescheduleModal(true);
  };

  const handleCancel = (appt: any) => {
    setSelectedAppt(appt);
    setShowCancelModal(true);
  };

  const applyReschedule = (apptId: number, newDate: string, newTime: string) => {
    const updated = appointments.map((a) =>
      a.id === apptId ? { ...a, date: newDate, time: newTime } : a
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    setAppointments(updated);
    setShowRescheduleModal(false);
  };

  const confirmCancel = (apptId: number) => {
    const updated = appointments.map((a) =>
      a.id === apptId ? { ...a, status: "cancelled" } : a
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    setAppointments(updated);
    setShowCancelModal(false);
  };

  const upcomingAppointments = appointments.filter((a) => a.status === "upcoming");
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled");
  const visitedAppointments = appointments.filter((a) => a.status === "visited");

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-100 via-white to-blue-50">
      {/* Header with Logo and Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:text-blue-800 text-xl font-bold"
        >
          ←
        </button>
        <div className="flex flex-col items-center flex-grow">
          <div className="flex flex-col items-center gap-2">
  <Image
    src="https://i.postimg.cc/SKnMMNcw/360-F-863843181-63-Nv8tgy-BU8-X26-B1-Lq-Qvfi0tn95aj-Sg-X.jpg"
    alt="Shedula Logo"
    width={50}
    height={50}
    className="rounded-full"
  />
  <h1
    className="text-4xl text-blue-700"
    style={{ fontFamily: "'Lobster', cursive" }}
  >
    Shedula
  </h1>
  <p className="text-sm text-gray-600 italic">
    Find the right doctor for your needs
  </p>
</div>
        </div>
        <div className="w-6" /> {/* Spacer to balance back button */}
      </div>

      {/* Page Title and Toggles */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
        <div className="flex gap-4">
          <button
            className="text-sm font-semibold text-indigo-700 hover:underline"
            onClick={() => setShowCancelled(!showCancelled)}
          >
            {showCancelled ? "Hide Cancelled" : "Show Cancelled"}
          </button>
          <button
            className="text-sm font-semibold text-indigo-700 hover:underline"
            onClick={() => setShowVisited(!showVisited)}
          >
            {showVisited ? "Hide Visited" : "Show Visited"}
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length === 0 && !showCancelled && !showVisited && (
        <p className="text-gray-800">You have no upcoming appointments.</p>
      )}

      {upcomingAppointments.map((app) => (
        <div key={app.id} className="bg-white rounded-xl p-4 shadow-md mb-4">
          <AppointmentDetails
            appointment={app}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
          />
          <div className="mt-3 text-gray-900 text-sm">
            <p><strong>Patient:</strong> {app.patientName}, Age {app.patientAge}</p>
            {app.description && <p><strong>Description:</strong> {app.description}</p>}
            <p className="mt-1 text-indigo-600 font-medium">
              {getTimeRemaining(app.date, app.time)}
            </p>
          </div>
          <div className="mt-2 text-gray-900">
            <Rating appointment={app} />
            <NotesSection appointment={app} />
          </div>
        </div>
      ))}

      {/* Cancelled Appointments */}
      {showCancelled && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Cancelled Appointments</h2>
          {cancelledAppointments.length === 0 ? (
            <p className="text-gray-800">No cancelled appointments.</p>
          ) : (
            cancelledAppointments.map((app) => (
              <div key={app.id} className="bg-white rounded-xl p-4 shadow-md mb-4">
                <AppointmentDetails appointment={app} />
                <div className="mt-3 text-gray-900 text-sm">
                  <p><strong>Patient:</strong> {app.patientName}, Age {app.patientAge}</p>
                  {app.description && <p><strong>Description:</strong> {app.description}</p>}
                                </div>
                <div className="mt-2 text-gray-900">
                  <Rating appointment={app} />
                  <NotesSection appointment={app} />
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Visited Appointments */}
      {showVisited && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Visited Appointments</h2>
          {visitedAppointments.length === 0 ? (
            <p className="text-gray-800">No visited appointments yet.</p>
          ) : (
            visitedAppointments.map((app) => (
              <div key={app.id} className="bg-white rounded-xl p-4 shadow-md mb-4">
                <AppointmentDetails appointment={app} />
                <div className="mt-3 text-gray-900 text-sm">
                  <p><strong>Patient:</strong> {app.patientName}, Age {app.patientAge}</p>
                  {app.description && <p><strong>Description:</strong> {app.description}</p>}
                  <p className="mt-1 text-green-700 font-medium">Visited</p>
                </div>
                <div className="mt-2 text-gray-900">
                  <Rating appointment={app} />
                  <NotesSection appointment={app} />
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Modals */}
      {showRescheduleModal && selectedAppt && (
        <RescheduleModal
          appointment={selectedAppt}
          onClose={() => setShowRescheduleModal(false)}
          onSave={applyReschedule}
        />
      )}

      {showCancelModal && selectedAppt && (
        <CancelModal
          appointment={selectedAppt}
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => confirmCancel(selectedAppt.id)}
        />
      )}
    </div>
  );
}