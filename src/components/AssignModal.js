import React, { useState } from "react";

const AssignModal = ({ show, onClose, doctors, preReaders, selectedDoctor, setSelectedDoctor, selectedPreReader, 
   setSelectedPreReader, assignedStaff, handleAssignParticipants, handleChangeParticipants, }) => {

   const [isEditing, setIsEditing] = useState(false);
 
   if (!show) return null;
 
   const handleChangeClick = () => {
     setIsEditing(true);
   };
 
   const handleSaveClick = async () => {
     try {
       console.log("Saving updated participants...");
       await handleChangeParticipants();
     } catch (error) {
       console.error("Error updating participants:", error);
     }
   };
 
   return (
     <div className="modal">
       <div className="modal-content">
         <h3>Assign Doctor and Pre-Reader</h3> 
         {assignedStaff.doctorId || assignedStaff.preReaderId ? (
           <>
             <p>
               Assigned Doctor: {assignedStaff.doctorId || "None"} PractitionerId
             </p>
             <p>
               Assigned Pre-Reader: {assignedStaff.preReaderId || "None"} PractitionerId
             </p>
             {!isEditing ? (
               <div className="modal-actions">
                 <button onClick={handleChangeClick}>Change</button>
                 <button onClick={onClose}>Cancel</button>
               </div>
             ) : (
               <>
                 <select
                   value={selectedDoctor}
                   onChange={(e) => setSelectedDoctor(e.target.value)}
                 >
                   <option value="">Select Doctor</option>
                   {doctors.map((doctor) => (
                     <option key={doctor.id} value={doctor.practitionerId}>
                       {doctor.username}
                     </option>
                   ))}
                 </select> 
                 <select
                   value={selectedPreReader}
                   onChange={(e) => setSelectedPreReader(e.target.value)}
                 >
                   <option value="">Select Pre-Reader</option>
                   {preReaders.map((preReader) => (
                     <option key={preReader.id} value={preReader.practitionerId}>
                       {preReader.username}
                     </option>
                   ))}
                 </select> 
                 <div className="modal-actions">
                   <button onClick={handleSaveClick}>Save</button>
                   <button onClick={onClose}>Cancel</button>
                 </div>
               </>
             )}
           </>
         ) : (
           <>
             <p>No assigned staff yet</p>
             <select
               value={selectedDoctor}
               onChange={(e) => setSelectedDoctor(e.target.value)}
             >
               <option value="">Select Doctor</option>
               {doctors.map((doctor) => (
                 <option key={doctor.id} value={doctor.practitionerId}>
                   {doctor.username}
                 </option>
               ))}
             </select> 
             <select
               value={selectedPreReader}
               onChange={(e) => setSelectedPreReader(e.target.value)}
             >
               <option value="">Select Pre-Reader</option>
               {preReaders.map((preReader) => (
                 <option key={preReader.id} value={preReader.practitionerId}>
                   {preReader.username}
                 </option>
               ))}
             </select> 
             <div className="modal-actions">
               <button onClick={handleAssignParticipants}>Assign</button>
               <button onClick={onClose}>Cancel</button>
             </div>
           </>
         )}
       </div>
     </div>
   );
 };
 
 export default AssignModal;


 
 