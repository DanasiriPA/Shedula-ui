// app/my-appointments/components/NotesSection.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaEdit, FaTrash, FaStickyNote } from 'react-icons/fa';

interface NotesSectionProps {
  appointmentId: string; // To link notes to a specific appointment
}

const NOTES_STORAGE_KEY = 'appointment_notes';

const NotesSection: React.FC<NotesSectionProps> = ({ appointmentId }) => {
  const [notes, setNotes] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNotes = localStorage.getItem(`${NOTES_STORAGE_KEY}_${appointmentId}`);
      if (storedNotes) {
        setNotes(storedNotes);
        setIsEditing(false); // Start in view mode if notes exist
      } else {
        setIsEditing(true); // Start in edit mode if no notes
      }
    }
  }, [appointmentId]);

  const handleSaveNotes = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${NOTES_STORAGE_KEY}_${appointmentId}`, notes);
      setIsEditing(false);
    }
  };

  const handleDeleteNotes = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${NOTES_STORAGE_KEY}_${appointmentId}`);
      setNotes('');
      setIsEditing(true); // Go back to edit mode as notes are empty
    }
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <FaStickyNote className="text-purple-500" /> Patient Notes
      </h4>

      {isEditing ? (
        <>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-h-[120px] text-gray-800"
            placeholder="Add notes about this appointment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
          <div className="flex gap-2 mt-3">
            <motion.button
              onClick={handleSaveNotes}
              className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSave /> Save Notes
            </motion.button>
            {notes && (
                <motion.button
                    onClick={handleDeleteNotes}
                    className="flex-1 py-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FaTrash /> Delete Notes
                </motion.button>
            )}
          </div>
        </>
      ) : (
        <div className="relative group">
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[120px] whitespace-pre-wrap">
            {notes || "No notes added for this appointment yet."}
          </p>
          <motion.button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 p-2 bg-blue-100 text-blue-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaEdit />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default NotesSection;