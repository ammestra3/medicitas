package com.medicitas.service;

import com.medicitas.dto.DisabilityDTO;
import com.medicitas.entity.Disability;
import com.medicitas.entity.User;
import com.medicitas.repository.DisabilityRepository;
import com.medicitas.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DisabilityService {

    private final DisabilityRepository disabilityRepository;
    private final UserRepository userRepository;

    public DisabilityService(DisabilityRepository disabilityRepository, UserRepository userRepository) {
        this.disabilityRepository = disabilityRepository;
        this.userRepository = userRepository;
    }

    public DisabilityDTO.Response create(DisabilityDTO.Request req, User doctor) {
        User patient = userRepository.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        Disability d = Disability.builder()
                .patient(patient).doctor(doctor).reason(req.getReason())
                .startDate(req.getStartDate()).endDate(req.getEndDate()).notes(req.getNotes()).build();
        return DisabilityDTO.Response.from(disabilityRepository.save(d));
    }

    public List<DisabilityDTO.Response> getByPatient(Long patientId) {
        return disabilityRepository.findByPatientIdOrderByStartDateDesc(patientId)
                .stream().map(DisabilityDTO.Response::from).toList();
    }
}
