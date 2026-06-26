package com.medicitas.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord record;

    @Column(nullable = false, length = 100)
    private String medication;

    @Column(nullable = false, length = 50)
    private String dose;

    @Column(nullable = false, length = 100)
    private String frequency;

    @Column(length = 100)
    private String duration;

    @Column(length = 300)
    private String instructions;

    public Prescription() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private MedicalRecord record;
        private String medication, dose, frequency, duration, instructions;
        public Builder record(MedicalRecord v)    { this.record = v; return this; }
        public Builder medication(String v)       { this.medication = v; return this; }
        public Builder dose(String v)             { this.dose = v; return this; }
        public Builder frequency(String v)        { this.frequency = v; return this; }
        public Builder duration(String v)         { this.duration = v; return this; }
        public Builder instructions(String v)     { this.instructions = v; return this; }
        public Prescription build() {
            Prescription p = new Prescription();
            p.record = record; p.medication = medication; p.dose = dose;
            p.frequency = frequency; p.duration = duration; p.instructions = instructions;
            return p;
        }
    }

    public Long getId()             { return id; }
    public MedicalRecord getRecord(){ return record; }
    public String getMedication()   { return medication; }
    public String getDose()         { return dose; }
    public String getFrequency()    { return frequency; }
    public String getDuration()     { return duration; }
    public String getInstructions() { return instructions; }
}
