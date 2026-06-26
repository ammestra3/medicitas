package com.medicitas.dto;

import com.medicitas.entity.Appointment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDTO {

    public static class CreateRequest {
        @NotNull  private Long doctorId;
        @NotBlank private String specialty;
        @NotNull  private LocalDate date;
        @NotNull  private LocalTime time;
        private String reason;
        public Long getDoctorId()    { return doctorId; }
        public String getSpecialty() { return specialty; }
        public LocalDate getDate()   { return date; }
        public LocalTime getTime()   { return time; }
        public String getReason()    { return reason; }
        public void setDoctorId(Long v)    { this.doctorId = v; }
        public void setSpecialty(String v) { this.specialty = v; }
        public void setDate(LocalDate v)   { this.date = v; }
        public void setTime(LocalTime v)   { this.time = v; }
        public void setReason(String v)    { this.reason = v; }
    }

    public static class RescheduleRequest {
        @NotNull private LocalDate date;
        @NotNull private LocalTime time;
        private String reason;
        public LocalDate getDate()  { return date; }
        public LocalTime getTime()  { return time; }
        public String getReason()   { return reason; }
        public void setDate(LocalDate v)  { this.date = v; }
        public void setTime(LocalTime v)  { this.time = v; }
        public void setReason(String v)   { this.reason = v; }
    }

    public static class CancelRequest {
        private String reason;
        public String getReason()         { return reason; }
        public void setReason(String v)   { this.reason = v; }
    }

    public static class Response {
        private Long   id;
        private Long   patientId;
        private String patientName;
        private String patientDocumentId;
        private Long   doctorId;
        private String doctorName;
        private String specialty;
        private String date;
        private String time;
        private String reason;
        private String cancelReason;
        private String status;
        private Long   medicalRecordId;

        public static Response from(Appointment a) {
            Response r = new Response();
            r.id                = a.getId();
            r.patientId         = a.getPatient().getId();
            r.patientName       = a.getPatient().getName() + " " + a.getPatient().getLastName();
            r.patientDocumentId = a.getPatient().getDocumentId();
            if (a.getDoctorUser() != null) {
                r.doctorId   = a.getDoctorUser().getId();
                r.doctorName = a.getDoctorUser().getName() + " " + a.getDoctorUser().getLastName();
            } else {
                r.doctorName = a.getDoctor();
            }
            r.specialty       = a.getSpecialty();
            r.date            = a.getDate().toString();
            r.time            = a.getTime().toString().substring(0, 5);
            r.reason          = a.getReason();
            r.cancelReason    = a.getCancelReason();
            r.status          = a.getStatus().name().toLowerCase();
            r.medicalRecordId = a.getMedicalRecordId();
            return r;
        }

        public Long   getId()               { return id; }
        public Long   getPatientId()        { return patientId; }
        public String getPatientName()      { return patientName; }
        public String getPatientDocumentId(){ return patientDocumentId; }
        public Long   getDoctorId()         { return doctorId; }
        public String getDoctorName()       { return doctorName; }
        public String getSpecialty()        { return specialty; }
        public String getDate()             { return date; }
        public String getTime()             { return time; }
        public String getReason()           { return reason; }
        public String getCancelReason()     { return cancelReason; }
        public String getStatus()           { return status; }
        public Long   getMedicalRecordId()  { return medicalRecordId; }
    }

    public static class SlotResponse {
        private String time;
        private boolean available;
        public SlotResponse(String time, boolean available) {
            this.time = time;
            this.available = available;
        }
        public String  getTime()     { return time; }
        public boolean isAvailable() { return available; }
    }
}
