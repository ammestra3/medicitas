package com.medicitas.dto;

import jakarta.validation.constraints.*;

public class AuthDTO {

    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank        private String password;
        public String getEmail()    { return email; }
        public String getPassword() { return password; }
        public void setEmail(String v)    { this.email = v; }
        public void setPassword(String v) { this.password = v; }
    }

    public static class RegisterPatientRequest {
        @NotBlank @Size(min=2,max=50) private String name;
        @NotBlank @Size(min=2,max=50) private String lastName;
        @NotBlank @Pattern(regexp="^\\d{1,20}$", message="Cedula: solo numeros") private String documentId;
        @Email @NotBlank              private String email;
        @NotBlank @Size(min=6)        private String password;
        @Pattern(regexp="^\\d{10}$|^$", message="Telefono: 10 digitos") private String phone;
        private String address;
        public String getName()       { return name; }
        public String getLastName()   { return lastName; }
        public String getDocumentId() { return documentId; }
        public String getEmail()      { return email; }
        public String getPassword()   { return password; }
        public String getPhone()      { return phone; }
        public String getAddress()    { return address; }
        public void setName(String v)       { this.name = v; }
        public void setLastName(String v)   { this.lastName = v; }
        public void setDocumentId(String v) { this.documentId = v; }
        public void setEmail(String v)      { this.email = v; }
        public void setPassword(String v)   { this.password = v; }
        public void setPhone(String v)      { this.phone = v; }
        public void setAddress(String v)    { this.address = v; }
    }

    public static class RegisterDoctorRequest {
        @NotBlank @Size(min=2,max=50) private String name;
        @NotBlank @Size(min=2,max=50) private String lastName;
        @NotBlank @Pattern(regexp="^\\d{1,20}$", message="Cedula: solo numeros") private String documentId;
        @NotBlank @Pattern(regexp="^\\d{4,15}$", message="RM: entre 4 y 15 digitos") private String medicalReg;
        @Email @NotBlank              private String email;
        @NotBlank @Size(min=6)        private String password;
        @NotBlank                     private String specialty;
        public String getName()       { return name; }
        public String getLastName()   { return lastName; }
        public String getDocumentId() { return documentId; }
        public String getMedicalReg() { return medicalReg; }
        public String getEmail()      { return email; }
        public String getPassword()   { return password; }
        public String getSpecialty()  { return specialty; }
        public void setName(String v)       { this.name = v; }
        public void setLastName(String v)   { this.lastName = v; }
        public void setDocumentId(String v) { this.documentId = v; }
        public void setMedicalReg(String v) { this.medicalReg = v; }
        public void setEmail(String v)      { this.email = v; }
        public void setPassword(String v)   { this.password = v; }
        public void setSpecialty(String v)  { this.specialty = v; }
    }

    public static class ChangePasswordRequest {
        @NotBlank private String currentPassword;
        @NotBlank private String newPassword;
        public String getCurrentPassword() { return currentPassword; }
        public String getNewPassword()     { return newPassword; }
        public void setCurrentPassword(String v) { this.currentPassword = v; }
        public void setNewPassword(String v)     { this.newPassword = v; }
    }

    public static class ResetPasswordRequest {
        @Email @NotBlank private String email;
        @NotBlank        private String newPassword;
        public String getEmail()      { return email; }
        public String getNewPassword(){ return newPassword; }
        public void setEmail(String v)      { this.email = v; }
        public void setNewPassword(String v){ this.newPassword = v; }
    }

    public static class JwtResponse {
        private final String token, name, lastName, email, role, medicalReg, specialty, documentId;
        private final Long id;
        public JwtResponse(String token, Long id, String name, String lastName, String email,
                           String role, String medicalReg, String specialty, String documentId) {
            this.token=token; this.id=id; this.name=name; this.lastName=lastName;
            this.email=email; this.role=role; this.medicalReg=medicalReg;
            this.specialty=specialty; this.documentId=documentId;
        }
        public String getToken()      { return token; }
        public Long   getId()         { return id; }
        public String getName()       { return name; }
        public String getLastName()   { return lastName; }
        public String getEmail()      { return email; }
        public String getRole()       { return role; }
        public String getMedicalReg() { return medicalReg; }
        public String getSpecialty()  { return specialty; }
        public String getDocumentId() { return documentId; }
    }
}
