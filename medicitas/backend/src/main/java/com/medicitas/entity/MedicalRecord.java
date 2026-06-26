package com.medicitas.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(nullable = false, length = 500)
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }

    public MedicalRecord() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User patient, doctor; private String diagnosis, notes;
        public Builder patient(User v)    { this.patient = v; return this; }
        public Builder doctor(User v)     { this.doctor = v; return this; }
        public Builder diagnosis(String v){ this.diagnosis = v; return this; }
        public Builder notes(String v)    { this.notes = v; return this; }
        public MedicalRecord build() {
            MedicalRecord r = new MedicalRecord();
            r.patient = patient; r.doctor = doctor;
            r.diagnosis = diagnosis; r.notes = notes;
            return r;
        }
    }

    public Long getId()           { return id; }
    public User getPatient()      { return patient; }
    public User getDoctor()       { return doctor; }
    public String getDiagnosis()  { return diagnosis; }
    public String getNotes()      { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
