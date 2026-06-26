package com.medicitas.dto;

import com.medicitas.entity.MedicalRecord;
import com.medicitas.entity.Prescription;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MedicalRecordDTO {

    public static class Request {
        @NotBlank private String diagnosis;
        private String notes;
        @NotNull  private Long patientId;
        private List<PrescriptionItem> prescriptions;
        public String getDiagnosis()                  { return diagnosis; }
        public String getNotes()                      { return notes; }
        public Long getPatientId()                    { return patientId; }
        public List<PrescriptionItem> getPrescriptions(){ return prescriptions; }
        public void setDiagnosis(String v)                   { this.diagnosis = v; }
        public void setNotes(String v)                       { this.notes = v; }
        public void setPatientId(Long v)                     { this.patientId = v; }
        public void setPrescriptions(List<PrescriptionItem> v){ this.prescriptions = v; }
    }

    public static class PrescriptionItem {
        private String medication, dose, frequency, duration, instructions;
        public String getMedication()   { return medication; }
        public String getDose()         { return dose; }
        public String getFrequency()    { return frequency; }
        public String getDuration()     { return duration; }
        public String getInstructions() { return instructions; }
        public void setMedication(String v)  { this.medication = v; }
        public void setDose(String v)        { this.dose = v; }
        public void setFrequency(String v)   { this.frequency = v; }
        public void setDuration(String v)    { this.duration = v; }
        public void setInstructions(String v){ this.instructions = v; }
    }

    public static class Response {
        private Long id; private String diagnosis, notes, createdAt;
        private String doctorName, doctorSpecialty, doctorMedicalReg;
        private String patientName, patientDocumentId;
        private List<PrescriptionResponse> prescriptions;

        public static Response from(MedicalRecord r, List<Prescription> presc) {
            Response res = new Response();
            res.id=r.getId(); res.diagnosis=r.getDiagnosis(); res.notes=r.getNotes();
            res.createdAt=r.getCreatedAt().toString();
            res.doctorName=r.getDoctor().getName()+" "+r.getDoctor().getLastName();
            res.doctorSpecialty=r.getDoctor().getSpecialty();
            res.doctorMedicalReg=r.getDoctor().getMedicalReg();
            res.patientName=r.getPatient().getName()+" "+r.getPatient().getLastName();
            res.patientDocumentId=r.getPatient().getDocumentId();
            res.prescriptions=presc.stream().map(PrescriptionResponse::from).toList();
            return res;
        }
        public Long   getId()               { return id; }
        public String getDiagnosis()        { return diagnosis; }
        public String getNotes()            { return notes; }
        public String getCreatedAt()        { return createdAt; }
        public String getDoctorName()       { return doctorName; }
        public String getDoctorSpecialty()  { return doctorSpecialty; }
        public String getDoctorMedicalReg() { return doctorMedicalReg; }
        public String getPatientName()      { return patientName; }
        public String getPatientDocumentId(){ return patientDocumentId; }
        public List<PrescriptionResponse> getPrescriptions(){ return prescriptions; }
    }

    public static class PrescriptionResponse {
        private Long id; private String medication, dose, frequency, duration, instructions;
        public static PrescriptionResponse from(Prescription p) {
            PrescriptionResponse r = new PrescriptionResponse();
            r.id=p.getId(); r.medication=p.getMedication(); r.dose=p.getDose();
            r.frequency=p.getFrequency(); r.duration=p.getDuration(); r.instructions=p.getInstructions();
            return r;
        }
        public Long   getId()            { return id; }
        public String getMedication()    { return medication; }
        public String getDose()          { return dose; }
        public String getFrequency()     { return frequency; }
        public String getDuration()      { return duration; }
        public String getInstructions()  { return instructions; }
    }
}
