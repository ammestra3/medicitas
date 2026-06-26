package com.medicitas.entity;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "document_id", unique = true, length = 20)
    private String documentId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 10)
    private String phone;

    @Column(length = 200)
    private String address;

    @Column(length = 60)
    private String specialty;

    @Column(name = "family_doctor", length = 100)
    private String familyDoctor;

    @Column(name = "medical_reg", length = 15)
    private String medicalReg;

    @Column(name = "last_specialty_update")
    private LocalDateTime lastSpecialtyUpdate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role;

    public User() {}

    public User(Long id, String name, String lastName, String documentId, String email,
                String password, String phone, String address, String specialty,
                String familyDoctor, String medicalReg, LocalDateTime lastSpecialtyUpdate, Role role) {
        this.id = id; this.name = name; this.lastName = lastName;
        this.documentId = documentId; this.email = email; this.password = password;
        this.phone = phone; this.address = address; this.specialty = specialty;
        this.familyDoctor = familyDoctor; this.medicalReg = medicalReg;
        this.lastSpecialtyUpdate = lastSpecialtyUpdate; this.role = role;
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String name, lastName, documentId, email, password;
        private String phone, address, specialty, familyDoctor, medicalReg;
        private LocalDateTime lastSpecialtyUpdate; private Role role;
        public Builder id(Long v)                    { this.id = v; return this; }
        public Builder name(String v)                { this.name = v; return this; }
        public Builder lastName(String v)            { this.lastName = v; return this; }
        public Builder documentId(String v)          { this.documentId = v; return this; }
        public Builder email(String v)               { this.email = v; return this; }
        public Builder password(String v)            { this.password = v; return this; }
        public Builder phone(String v)               { this.phone = v; return this; }
        public Builder address(String v)             { this.address = v; return this; }
        public Builder specialty(String v)           { this.specialty = v; return this; }
        public Builder familyDoctor(String v)        { this.familyDoctor = v; return this; }
        public Builder medicalReg(String v)          { this.medicalReg = v; return this; }
        public Builder lastSpecialtyUpdate(LocalDateTime v){ this.lastSpecialtyUpdate = v; return this; }
        public Builder role(Role v)                  { this.role = v; return this; }
        public User build() {
            return new User(id, name, lastName, documentId, email, password,
                    phone, address, specialty, familyDoctor, medicalReg, lastSpecialtyUpdate, role);
        }
    }

    public Long getId()                          { return id; }
    public String getName()                      { return name; }
    public String getLastName()                  { return lastName; }
    public String getDocumentId()                { return documentId; }
    public String getEmail()                     { return email; }
    public String getPhone()                     { return phone; }
    public String getAddress()                   { return address; }
    public String getSpecialty()                 { return specialty; }
    public String getFamilyDoctor()              { return familyDoctor; }
    public String getMedicalReg()                { return medicalReg; }
    public LocalDateTime getLastSpecialtyUpdate(){ return lastSpecialtyUpdate; }
    public Role getRole()                        { return role; }

    public void setId(Long v)                          { this.id = v; }
    public void setName(String v)                      { this.name = v; }
    public void setLastName(String v)                  { this.lastName = v; }
    public void setDocumentId(String v)                { this.documentId = v; }
    public void setEmail(String v)                     { this.email = v; }
    public void setPassword(String v)                  { this.password = v; }
    public void setPhone(String v)                     { this.phone = v; }
    public void setAddress(String v)                   { this.address = v; }
    public void setSpecialty(String v)                 { this.specialty = v; }
    public void setFamilyDoctor(String v)              { this.familyDoctor = v; }
    public void setMedicalReg(String v)                { this.medicalReg = v; }
    public void setLastSpecialtyUpdate(LocalDateTime v){ this.lastSpecialtyUpdate = v; }
    public void setRole(Role v)                        { this.role = v; }

    @Override public String getPassword()              { return password; }
    @Override public String getUsername()              { return email; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }

    public enum Role { PATIENT, DOCTOR, ADMIN }
}
