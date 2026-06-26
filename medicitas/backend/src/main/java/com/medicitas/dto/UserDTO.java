package com.medicitas.dto;

import com.medicitas.entity.User;
import java.time.LocalDateTime;

public class UserDTO {

    public static class ProfileResponse {
        private Long   id;
        private String name, lastName, documentId, email, phone, address;
        private String specialty, familyDoctor, medicalReg, role;
        private String lastSpecialtyUpdate;
        private boolean canUpdateSpecialty;

        public static ProfileResponse from(User u) {
            ProfileResponse r = new ProfileResponse();
            r.id           = u.getId();
            r.name         = u.getName();
            r.lastName     = u.getLastName();
            r.documentId   = u.getDocumentId();
            r.email        = u.getEmail();
            r.phone        = u.getPhone();
            r.address      = u.getAddress();
            r.specialty    = u.getSpecialty() != null ? u.getSpecialty() : "";
            r.familyDoctor = u.getFamilyDoctor() != null ? u.getFamilyDoctor() : "Sin asignar";
            r.medicalReg   = u.getMedicalReg();
            r.role         = u.getRole().name();
            if (u.getLastSpecialtyUpdate() != null) {
                r.lastSpecialtyUpdate = u.getLastSpecialtyUpdate().toString();
                LocalDateTime nextAllowed = u.getLastSpecialtyUpdate().plusWeeks(1);
                r.canUpdateSpecialty = LocalDateTime.now().isAfter(nextAllowed);
            } else {
                r.canUpdateSpecialty = true;
            }
            return r;
        }

        public Long    getId()                   { return id; }
        public String  getName()                 { return name; }
        public String  getLastName()             { return lastName; }
        public String  getDocumentId()           { return documentId; }
        public String  getEmail()                { return email; }
        public String  getPhone()                { return phone; }
        public String  getAddress()              { return address; }
        public String  getSpecialty()            { return specialty; }
        public String  getFamilyDoctor()         { return familyDoctor; }
        public String  getMedicalReg()           { return medicalReg; }
        public String  getRole()                 { return role; }
        public String  getLastSpecialtyUpdate()  { return lastSpecialtyUpdate; }
        public boolean isCanUpdateSpecialty()    { return canUpdateSpecialty; }
    }

    public static class UpdatePatientRequest {
        private String name, lastName, phone, address;
        public String getName()        { return name; }
        public String getLastName()    { return lastName; }
        public String getPhone()       { return phone; }
        public String getAddress()     { return address; }
        public void setName(String v)      { this.name = v; }
        public void setLastName(String v)  { this.lastName = v; }
        public void setPhone(String v)     { this.phone = v; }
        public void setAddress(String v)   { this.address = v; }
    }

    public static class UpdateDoctorRequest {
        private String name, lastName, phone, specialty;
        public String getName()       { return name; }
        public String getLastName()   { return lastName; }
        public String getPhone()      { return phone; }
        public String getSpecialty()  { return specialty; }
        public void setName(String v)      { this.name = v; }
        public void setLastName(String v)  { this.lastName = v; }
        public void setPhone(String v)     { this.phone = v; }
        public void setSpecialty(String v) { this.specialty = v; }
    }

    public static class SimpleUserResponse {
        private Long   id;
        private String name, documentId, email, role, specialty;

        public static SimpleUserResponse from(User u) {
            SimpleUserResponse r = new SimpleUserResponse();
            r.id        = u.getId();
            r.name      = u.getName() + " " + u.getLastName();
            r.documentId= u.getDocumentId();
            r.email     = u.getEmail();
            r.role      = u.getRole().name();
            r.specialty = u.getSpecialty() != null ? u.getSpecialty() : "";
            return r;
        }

        public Long   getId()         { return id; }
        public String getName()       { return name; }
        public String getDocumentId() { return documentId; }
        public String getEmail()      { return email; }
        public String getRole()       { return role; }
        public String getSpecialty()  { return specialty; }
    }
}
