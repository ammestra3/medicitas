package com.medicitas.service;

import com.medicitas.dto.AppointmentDTO;
import com.medicitas.entity.Appointment;
import com.medicitas.entity.Appointment.Status;
import com.medicitas.entity.User;
import com.medicitas.repository.AppointmentRepository;
import com.medicitas.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {

    private static final LocalTime OPEN         = LocalTime.of(7, 0);
    private static final LocalTime CLOSE        = LocalTime.of(18, 0);
    private static final int       SLOT_MINUTES = 30;

    private final AppointmentRepository repository;
    private final UserRepository        userRepository;

    public AppointmentService(AppointmentRepository repository, UserRepository userRepository) {
        this.repository     = repository;
        this.userRepository = userRepository;
    }

    public List<AppointmentDTO.Response> getByPatient(User patient) {
        return repository.findByPatientIdOrderByDateAscTimeAsc(patient.getId())
                .stream().map(AppointmentDTO.Response::from).toList();
    }

    public AppointmentDTO.Response create(AppointmentDTO.CreateRequest req, User patient) {
        User doctor = userRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Medico no encontrado"));

        if (req.getTime().isBefore(OPEN) || req.getTime().compareTo(CLOSE.minusMinutes(SLOT_MINUTES)) > 0)
            throw new IllegalArgumentException("Horario fuera del rango permitido (7:00 - 17:30)");

        if (!repository.findConflict(doctor.getId(), req.getDate(), req.getTime()).isEmpty())
            throw new IllegalArgumentException("El horario seleccionado ya esta ocupado");

        Appointment a = Appointment.builder()
                .patient(patient)
                .doctorUser(doctor)
                .doctor(doctor.getName() + " " + doctor.getLastName())
                .specialty(req.getSpecialty())
                .date(req.getDate())
                .time(req.getTime())
                .reason(req.getReason())
                .status(Status.PENDING)
                .build();
        return AppointmentDTO.Response.from(repository.save(a));
    }

    public AppointmentDTO.Response cancel(Long id, User patient, String reason) {
        Appointment a = findAndCheckPatient(id, patient);
        a.setStatus(Status.CANCELLED);
        a.setCancelReason(reason);
        return AppointmentDTO.Response.from(repository.save(a));
    }

    public AppointmentDTO.Response reschedule(Long id, User patient, AppointmentDTO.RescheduleRequest req) {
        Appointment a = findAndCheckPatient(id, patient);
        if (!repository.findConflict(a.getDoctorUser().getId(), req.getDate(), req.getTime()).isEmpty())
            throw new IllegalArgumentException("El nuevo horario ya esta ocupado");
        a.setStatus(Status.RESCHEDULED);
        repository.save(a);
        Appointment newA = Appointment.builder()
                .patient(a.getPatient()).doctorUser(a.getDoctorUser()).doctor(a.getDoctor())
                .specialty(a.getSpecialty()).date(req.getDate()).time(req.getTime())
                .reason(req.getReason() != null ? req.getReason() : a.getReason())
                .status(Status.PENDING).build();
        return AppointmentDTO.Response.from(repository.save(newA));
    }

    public AppointmentDTO.Response confirm(Long id, User doctor) {
        Appointment a = findAndCheckDoctor(id, doctor);
        a.setStatus(Status.CONFIRMED);
        return AppointmentDTO.Response.from(repository.save(a));
    }

    public AppointmentDTO.Response complete(Long id, User doctor) {
        Appointment a = findAndCheckDoctor(id, doctor);
        a.setStatus(Status.COMPLETED);
        return AppointmentDTO.Response.from(repository.save(a));
    }

    public AppointmentDTO.Response cancelByDoctor(Long id, User doctor, String reason) {
        Appointment a = findAndCheckDoctor(id, doctor);
        a.setStatus(Status.CANCELLED);
        a.setCancelReason(reason);
        return AppointmentDTO.Response.from(repository.save(a));
    }

    public List<AppointmentDTO.Response> getDoctorWeek(User doctor, LocalDate from, LocalDate to) {
        return repository.findByDoctorAndWeek(doctor.getId(), from, to)
                .stream().map(AppointmentDTO.Response::from).toList();
    }

    public List<AppointmentDTO.Response> getDoctorToday(User doctor) {
        return repository.findTodayByDoctor(doctor.getId(), LocalDate.now())
                .stream().map(AppointmentDTO.Response::from).toList();
    }

    public List<AppointmentDTO.Response> getDoctorPending(User doctor) {
        return repository.findPendingByDoctor(doctor.getId())
                .stream().map(AppointmentDTO.Response::from).toList();
    }

    public List<AppointmentDTO.SlotResponse> getSlots(Long doctorId, LocalDate date) {
        List<Appointment> booked = repository.findByDoctorAndDate(doctorId, date);
        List<LocalTime> bookedTimes = booked.stream()
                .filter(a -> a.getStatus() != Status.CANCELLED && a.getStatus() != Status.RESCHEDULED)
                .map(Appointment::getTime).toList();

        List<AppointmentDTO.SlotResponse> slots = new ArrayList<>();
        LocalTime t = OPEN;
        while (t.isBefore(CLOSE)) {
            slots.add(new AppointmentDTO.SlotResponse(
                    t.toString().substring(0, 5),
                    !bookedTimes.contains(t)
            ));
            t = t.plusMinutes(SLOT_MINUTES);
        }
        return slots;
    }

    public void linkMedicalRecord(Long appointmentId, Long recordId) {
        repository.findById(appointmentId).ifPresent(a -> {
            a.setMedicalRecordId(recordId);
            repository.save(a);
        });
    }

    private Appointment findAndCheckPatient(Long id, User patient) {
        Appointment a = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        if (!a.getPatient().getId().equals(patient.getId()))
            throw new RuntimeException("No autorizado");
        return a;
    }

    private Appointment findAndCheckDoctor(Long id, User doctor) {
        Appointment a = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        if (a.getDoctorUser() == null || !a.getDoctorUser().getId().equals(doctor.getId()))
            throw new RuntimeException("No autorizado");
        return a;
    }
}
