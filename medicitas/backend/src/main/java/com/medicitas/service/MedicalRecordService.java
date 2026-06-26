package com.medicitas.service;

import com.medicitas.dto.MedicalRecordDTO;
import com.medicitas.entity.MedicalRecord;
import com.medicitas.entity.Prescription;
import com.medicitas.entity.User;
import com.medicitas.repository.MedicalRecordRepository;
import com.medicitas.repository.PrescriptionRepository;
import com.medicitas.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(MedicalRecordRepository recordRepository,
                                PrescriptionRepository prescriptionRepository,
                                UserRepository userRepository) {
        this.recordRepository = recordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MedicalRecordDTO.Response create(MedicalRecordDTO.Request req, User doctor) {
        User patient = userRepository.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        MedicalRecord record = MedicalRecord.builder()
                .patient(patient).doctor(doctor)
                .diagnosis(req.getDiagnosis()).notes(req.getNotes()).build();
        recordRepository.save(record);

        List<Prescription> prescriptions = Collections.emptyList();
        if (req.getPrescriptions() != null && !req.getPrescriptions().isEmpty()) {
            prescriptions = req.getPrescriptions().stream()
                    .filter(p -> p.getMedication() != null && !p.getMedication().isBlank())
                    .map(p -> Prescription.builder()
                            .record(record).medication(p.getMedication()).dose(p.getDose())
                            .frequency(p.getFrequency()).duration(p.getDuration())
                            .instructions(p.getInstructions()).build())
                    .toList();
            prescriptionRepository.saveAll(prescriptions);
        }
        return MedicalRecordDTO.Response.from(record, prescriptions);
    }

    public List<MedicalRecordDTO.Response> getByPatient(Long patientId) {
        return recordRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(r -> MedicalRecordDTO.Response.from(r,
                        prescriptionRepository.findByRecordId(r.getId())))
                .toList();
    }
}
