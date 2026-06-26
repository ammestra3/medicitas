package com.medicitas.service;

import com.medicitas.dto.AuthDTO;
import com.medicitas.entity.User;
import com.medicitas.repository.UserRepository;
import com.medicitas.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private static final int MAX_PATIENTS = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    public AuthDTO.JwtResponse login(AuthDTO.LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        return toResponse(userRepository.findByEmail(req.getEmail()).orElseThrow());
    }

    public AuthDTO.JwtResponse registerPatient(AuthDTO.RegisterPatientRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("El correo ya esta registrado");
        String doctor = assignRandomDoctor();
        User user = User.builder()
                .name(req.getName().toUpperCase().trim())
                .lastName(req.getLastName().toUpperCase().trim())
                .documentId(req.getDocumentId())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .address(req.getAddress())
                .familyDoctor(doctor)
                .role(User.Role.PATIENT)
                .build();
        userRepository.save(user);
        return toResponse(user);
    }

    public AuthDTO.JwtResponse registerDoctor(AuthDTO.RegisterDoctorRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("El correo ya esta registrado");
        User user = User.builder()
                .name(req.getName().toUpperCase().trim())
                .lastName(req.getLastName().toUpperCase().trim())
                .documentId(req.getDocumentId())
                .medicalReg(req.getMedicalReg())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .specialty(req.getSpecialty())
                .role(User.Role.DOCTOR)
                .build();
        userRepository.save(user);
        return toResponse(user);
    }

    public void changePassword(User user, AuthDTO.ChangePasswordRequest req) {
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
            throw new IllegalArgumentException("La contrasena actual es incorrecta");
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public void resetPassword(AuthDTO.ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No existe cuenta con ese correo"));
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    private String assignRandomDoctor() {
        List<User> doctors = userRepository.findAllDoctorsRandom();
        for (User doc : doctors) {
            String fullName = doc.getName() + " " + doc.getLastName();
            if (userRepository.countPatientsByFamilyDoctor(fullName) < MAX_PATIENTS)
                return fullName;
        }
        return null;
    }

    private AuthDTO.JwtResponse toResponse(User u) {
        return new AuthDTO.JwtResponse(jwtService.generateToken(u),
                u.getId(), u.getName(), u.getLastName(), u.getEmail(),
                u.getRole().name(), u.getMedicalReg(), u.getSpecialty(), u.getDocumentId());
    }
}
