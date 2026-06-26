package com.medicitas.dto;

import com.medicitas.entity.Disability;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class DisabilityDTO {

    public static class Request {
        @NotBlank private String reason;
        @NotNull  private LocalDate startDate;
        @NotNull  private LocalDate endDate;
        private String notes;
        @NotNull  private Long patientId;
        public String getReason()      { return reason; }
        public LocalDate getStartDate(){ return startDate; }
        public LocalDate getEndDate()  { return endDate; }
        public String getNotes()       { return notes; }
        public Long getPatientId()     { return patientId; }
        public void setReason(String v)      { this.reason = v; }
        public void setStartDate(LocalDate v){ this.startDate = v; }
        public void setEndDate(LocalDate v)  { this.endDate = v; }
        public void setNotes(String v)       { this.notes = v; }
        public void setPatientId(Long v)     { this.patientId = v; }
    }

    public static class Response {
        private Long id; private String reason, startDate, endDate, notes;
        private String doctorName, doctorMedicalReg, doctorSpecialty, patientName, patientDocumentId;

        public static Response from(Disability d) {
            Response r = new Response();
            r.id=d.getId(); r.reason=d.getReason();
            r.startDate=d.getStartDate().toString(); r.endDate=d.getEndDate().toString();
            r.notes=d.getNotes();
            r.doctorName=d.getDoctor().getName()+" "+d.getDoctor().getLastName();
            r.doctorMedicalReg=d.getDoctor().getMedicalReg();
            r.doctorSpecialty=d.getDoctor().getSpecialty();
            r.patientName=d.getPatient().getName()+" "+d.getPatient().getLastName();
            r.patientDocumentId=d.getPatient().getDocumentId();
            return r;
        }
        public Long   getId()               { return id; }
        public String getReason()           { return reason; }
        public String getStartDate()        { return startDate; }
        public String getEndDate()          { return endDate; }
        public String getNotes()            { return notes; }
        public String getDoctorName()       { return doctorName; }
        public String getDoctorMedicalReg() { return doctorMedicalReg; }
        public String getDoctorSpecialty()  { return doctorSpecialty; }
        public String getPatientName()      { return patientName; }
        public String getPatientDocumentId(){ return patientDocumentId; }
    }
}
