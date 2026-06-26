package com.medicitas.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "disabilities")
public class Disability {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(nullable = false, length = 300)
    private String reason;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String notes;

    public Disability() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User patient, doctor; private String reason, notes;
        private LocalDate startDate, endDate;
        public Builder patient(User v)       { this.patient = v; return this; }
        public Builder doctor(User v)        { this.doctor = v; return this; }
        public Builder reason(String v)      { this.reason = v; return this; }
        public Builder startDate(LocalDate v){ this.startDate = v; return this; }
        public Builder endDate(LocalDate v)  { this.endDate = v; return this; }
        public Builder notes(String v)       { this.notes = v; return this; }
        public Disability build() {
            Disability d = new Disability();
            d.patient = patient; d.doctor = doctor; d.reason = reason;
            d.startDate = startDate; d.endDate = endDate; d.notes = notes;
            return d;
        }
    }

    public Long getId()             { return id; }
    public User getPatient()        { return patient; }
    public User getDoctor()         { return doctor; }
    public String getReason()       { return reason; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate()   { return endDate; }
    public String getNotes()        { return notes; }
}
