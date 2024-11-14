// AssignModal.js
import React from 'react';
import './Modal.css';

const AssignModal = ({ 
   show, 
   onClose, 
   doctors, 
   nurses, 
   selectedDoctor, 
   setSelectedDoctor, 
   selectedNurse, 
   setSelectedNurse, 
   assignedStaff, 
   handleAssignParticipants 
}) => {
   if (!show) return null;

   return (
      <div className="modal">
         <div className="modal-content">
            <h3>Assign Doctor and Nurse</h3>
            
            {assignedStaff.doctorId || assignedStaff.nurseId ? (
               <>
                  <p>Assigned Doctor: {assignedStaff.doctorId || "None"} PractitionerId</p>
                  <p>Assigned Nurse: {assignedStaff.nurseId || "None"} PractitionerId</p>
               </>
            ) : (
               <p>No assigned staff yet</p>
            )}

            {/* Doctor dropdown */}
            <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
               <option value="">Select Doctor</option>
               {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.practitionerId}>{doctor.username}</option>
               ))}
            </select>

            {/* Nurse dropdown */}
            <select value={selectedNurse} onChange={(e) => setSelectedNurse(e.target.value)}>
               <option value="">Select Nurse</option>
               {nurses.map((nurse) => (
                  <option key={nurse.id} value={nurse.practitionerId}>{nurse.username}</option>
               ))}
            </select>

            <div className="modal-actions">
               <button 
                  onClick={handleAssignParticipants} 
                  disabled={!!assignedStaff.doctorId} 
                  style={{ opacity: assignedStaff.doctorId ? 0.5 : 1 }}
               >
                  Assign
               </button>
               <button onClick={onClose}>Cancel</button>
            </div>
         </div>
      </div>
   );
};

export default AssignModal;
