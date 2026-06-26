package com.medicitas.service;

import com.medicitas.dto.UserDTO;
import com.medicitas.entity.User;
import com.medicitas.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO.ProfileResponse getProfile(User user) {
        return UserDTO.ProfileResponse.from(user);
    }

    public UserDTO.ProfileResponse updatePatientProfile(User user, UserDTO.UpdatePatientRequest req) {
        if (req.getName()     != null) user.setName(req.getName().toUpperCase());
        if (req.getLastName() != null) user.setLastName(req.getLastName().toUpperCase());
        if (req.getPhone()    != null) user.setPhone(req.getPhone());
        if (req.getAddress()  != null) user.setAddress(req.getAddress());
        return UserDTO.ProfileResponse.from(userRepository.save(user));
    }

    public UserDTO.ProfileResponse updateDoctorProfile(User user, UserDTO.UpdateDoctorRequest req) {
        if (req.getName()     != null) user.setName(req.getName().toUpperCase());
        if (req.getLastName() != null) user.setLastName(req.getLastName().toUpperCase());
        if (req.getPhone()    != null) user.setPhone(req.getPhone());

        // Specialty can only be updated once per week
        if (req.getSpecialty() != null && !req.getSpecialty().isBlank()) {
            LocalDateTime lastUpdate = user.getLastSpecialtyUpdate();
            if (lastUpdate != null && LocalDateTime.now().isBefore(lastUpdate.plusWeeks(1))) {
                throw new IllegalArgumentException(
                    "La especialidad solo puede actualizarse una vez por semana. " +
                    "Proxima actualizacion disponible: " + lastUpdate.plusWeeks(1).toLocalDate()
                );
            }
            if (!req.getSpecialty().equals(user.getSpecialty())) {
                user.setSpecialty(req.getSpecialty());
                user.setLastSpecialtyUpdate(LocalDateTime.now());
            }
        }
        return UserDTO.ProfileResponse.from(userRepository.save(user));
    }

    public List<UserDTO.SimpleUserResponse> getPatients() {
        return userRepository.findByRole(User.Role.PATIENT)
                .stream().map(UserDTO.SimpleUserResponse::from).toList();
    }

    public List<UserDTO.SimpleUserResponse> getDoctors() {
        return userRepository.findByRole(User.Role.DOCTOR)
                .stream().map(UserDTO.SimpleUserResponse::from).toList();
    }
}
