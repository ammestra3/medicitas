package com.medicitas.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    private User doctorUser;

    @Column(length = 100)
    private String doctor;

    @Column(nullable = false, length = 60)
    private String specialty;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime time;

    @Column(length = 300)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Status status;

    @Column(length = 300)
    private String cancelReason;

    @Column(name = "medical_record_id")
    private Long medicalRecordId;

    public Appointment() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User patient, doctorUser;
        private String doctor, specialty, reason, cancelReason;
        private LocalDate date;
        private LocalTime time;
        private Status status;
        private Long medicalRecordId;

        public Builder patient(User v)        { this.patient = v; return this; }
        public Builder doctorUser(User v)     { this.doctorUser = v; return this; }
        public Builder doctor(String v)       { this.doctor = v; return this; }
        public Builder specialty(String v)    { this.specialty = v; return this; }
        public Builder date(LocalDate v)      { this.date = v; return this; }
        public Builder time(LocalTime v)      { this.time = v; return this; }
        public Builder reason(String v)       { this.reason = v; return this; }
        public Builder cancelReason(String v) { this.cancelReason = v; return this; }
        public Builder status(Status v)       { this.status = v; return this; }
        public Builder medicalRecordId(Long v){ this.medicalRecordId = v; return this; }

        public Appointment build() {
            Appointment a = new Appointment();
            a.patient = patient; a.doctorUser = doctorUser; a.doctor = doctor;
            a.specialty = specialty; a.date = date; a.time = time;
            a.reason = reason; a.cancelReason = cancelReason;
            a.status = status; a.medicalRecordId = medicalRecordId;
            return a;
        }
    }

    public Long getId()              { return id; }
    public User getPatient()         { return patient; }
    public User getDoctorUser()      { return doctorUser; }
    public String getDoctor()        { return doctor; }
    public String getSpecialty()     { return specialty; }
    public LocalDate getDate()       { return date; }
    public LocalTime getTime()       { return time; }
    public String getReason()        { return reason; }
    public String getCancelReason()  { return cancelReason; }
    public Status getStatus()        { return status; }
    public Long getMedicalRecordId() { return medicalRecordId; }

    public void setStatus(Status v)        { this.status = v; }
    public void setCancelReason(String v)  { this.cancelReason = v; }
    public void setDate(LocalDate v)       { this.date = v; }
    public void setTime(LocalTime v)       { this.time = v; }
    public void setDoctorUser(User v)      { this.doctorUser = v; }
    public void setDoctor(String v)        { this.doctor = v; }
    public void setMedicalRecordId(Long v) { this.medicalRecordId = v; }

    public enum Status { PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED }
}
