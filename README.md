<div align="center">

# MediCitas

### Sistema de Gestion de Citas Medicas

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Plataforma fullstack para la gestion integral de citas medicas. Permite a pacientes agendar, cancelar y reprogramar citas en tiempo real, mientras los medicos administran su agenda desde un calendario semanal interactivo con soporte de firma digital y generacion de documentos PDF.

[Funcionalidades](#funcionalidades) · [Tecnologias](#tecnologias) · [Instalacion](#instalacion) · [Estructura](#estructura-del-proyecto) · [API](#endpoints-api)

</div>

---

## Vista general

MediCitas es una aplicacion web de dos portales — uno para pacientes y otro para medicos — con autenticacion JWT, roles diferenciados y comunicacion en tiempo real via chat. Los medicos pueden registrar historias clinicas, formulas medicas e incapacidades, que los pacientes pueden consultar y descargar en PDF con la firma digital del medico.

---

## Funcionalidades

### Portal del paciente

- Registro con asignacion automatica de medico de familia (maximo 30 pacientes por medico, seleccion aleatoria)
- Agendamiento de citas por especialidad con calendario de slots de 30 minutos entre 7:00 am y 6:00 pm
- Cancelacion y reprogramacion de citas con seleccion de nuevo horario disponible
- Visualizacion de historia clinica, formula medica e incapacidades en modo solo lectura
- Descarga de documentos medicos en PDF con firma del medico
- Chat con el medico tratante
- Recuperacion de contrasena
- Edicion de perfil con validaciones estrictas de formato

### Portal del medico

- Calendario semanal con vista de citas por hora (lunes a sabado, 7am a 6pm)
- Dashboard con citas del dia, pendientes de confirmacion y estadisticas en tiempo real
- Confirmacion, atencion y cancelacion de citas directamente desde el calendario
- Creacion de historias clinicas con formula medica (medicamento, dosis, frecuencia, duracion, indicaciones)
- Emision de certificados de incapacidad con calculo automatico de dias de reposo
- Firma digital integrada — dibujada en canvas o cargada como imagen — incluida en todos los PDFs generados
- Bloqueo de cambio de especialidad con periodo de 7 dias entre actualizaciones
- Analitica de citas con graficos por mes y distribucion por estado

### Seguridad y validaciones

- Autenticacion stateless con JWT (JJWT 0.12.3)
- Roles diferenciados `PATIENT` y `DOCTOR` con rutas protegidas en frontend y backend
- Validaciones en ambas capas: cedula solo numerica (max 20 digitos), telefono de 10 digitos, nombres en mayusculas sin caracteres especiales, correo con dominio valido (.com, .co, .net, etc.)
- CORS configurado para entornos de desarrollo local

---

## Tecnologias

| Capa | Tecnologia |
|------|------------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Base de datos | MySQL 8, Hibernate ORM |
| Autenticacion | JWT (JJWT 0.12.3) |
| Frontend | React 18, Vite 5, React Router v6 |
| HTTP Client | Axios con interceptores JWT |
| PDF | jsPDF 2.5 |
| Estilos | CSS puro con variables (sin frameworks) |

---

## Instalacion

### Requisitos previos

- Java 17 o superior
- Node.js 18 o superior
- MySQL 8.0
- Maven

### 1. Base de datos

Crear la base de datos en MySQL. Las tablas se generan automaticamente al iniciar el backend con `ddl-auto=update`.

```sql
CREATE DATABASE medicitas;
```

### 2. Configuracion del backend

Editar `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medicitas?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
spring.datasource.username=***********
spring.datasource.password=******

spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=true

jwt.secret=3f8e9d2a1b7c4f6e0a5b9c3d7e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6
jwt.expiration=86400000

server.port=8080
```

### 3. Ejecutar el backend

```bash
cd backend
./mvnw spring-boot:run
```

El servidor queda disponible en `http://localhost:8080`

### 4. Ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:3000`

El proxy de Vite redirige automaticamente `/api/*` al backend en el puerto 8080.

---

## Estructura del proyecto

```
medicitas/
├── backend/
│   └── src/main/java/com/medicitas/
│       ├── config/
│       │   ├── SecurityConfig.java       # Seguridad, CORS, rutas publicas
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java       # Login, registro, cambio de contrasena
│       │   ├── AppointmentController.java
│       │   ├── MedicalRecordController.java
│       │   ├── DisabilityController.java
│       │   ├── ChatController.java
│       │   ├── UserController.java
│       │   └── NotificationController.java
│       ├── dto/                          # Request y Response objects
│       ├── entity/                       # User, Appointment, MedicalRecord, Prescription, Disability, ChatMessage, Notification
│       ├── repository/                   # Spring Data JPA con queries nativas MySQL
│       ├── security/
│       │   ├── JwtService.java
│       │   ├── JwtFilter.java
│       │   └── UserDetailsServiceImpl.java
│       └── service/                      # Logica de negocio
│
└── frontend/
    └── src/
        ├── api/
        │   ├── axios.js                  # Instancia con interceptor JWT
        │   ├── services.js               # Llamadas a todos los endpoints
        │   ├── pdfGenerator.js           # Generacion de PDFs con jsPDF
        │   └── validators.js             # Reglas de validacion reutilizables
        ├── components/
        │   ├── Sidebar.jsx               # Navegacion con rutas por rol
        │   ├── Badge.jsx
        │   ├── FormField.jsx
        │   ├── Icons.jsx                 # SVG propios sin dependencias
        │   └── SignatureManager.jsx      # Canvas de firma digital
        ├── context/
        │   └── AuthContext.jsx           # Estado global de autenticacion
        ├── pages/
        │   ├── Login.jsx                 # Tres vistas: login, registro paciente, registro medico
        │   ├── Dashboard.jsx             # Vista diferente segun rol
        │   ├── Appointments.jsx          # Agendar, cancelar, reprogramar
        │   ├── Chat.jsx
        │   ├── patient/
        │   │   ├── Profile.jsx
        │   │   └── MedicalHistory.jsx    # Historia clinica, formulas, incapacidades
        │   └── doctor/
        │       ├── DoctorCalendar.jsx    # Calendario semanal + gestion de citas
        │       ├── DoctorProfile.jsx     # Perfil con bloqueo de especialidad
        │       ├── PatientRecords.jsx    # Registros medicos por paciente
        │       └── Analytics.jsx        # Graficos de citas
        └── styles/
            └── global.css               # Sistema de diseno con variables CSS
```

---

## Endpoints API

### Autenticacion (publicos)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Iniciar sesion |
| `POST` | `/api/auth/register/patient` | Registrar paciente |
| `POST` | `/api/auth/register/doctor` | Registrar medico |
| `POST` | `/api/auth/reset-password` | Recuperar contrasena |
| `PUT`  | `/api/auth/change-password` | Cambiar contrasena |

### Citas (requieren token)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET`  | `/api/appointments` | Citas del paciente autenticado |
| `POST` | `/api/appointments` | Agendar nueva cita |
| `PUT`  | `/api/appointments/{id}/cancel` | Cancelar cita (paciente) |
| `PUT`  | `/api/appointments/{id}/reschedule` | Reprogramar cita |
| `GET`  | `/api/appointments/slots?doctorId=&date=` | Horarios disponibles |
| `GET`  | `/api/doctor/appointments/today` | Citas del dia (medico) |
| `GET`  | `/api/doctor/appointments/pending` | Citas pendientes (medico) |
| `GET`  | `/api/doctor/appointments/week?from=&to=` | Agenda semanal |
| `PUT`  | `/api/appointments/{id}/confirm` | Confirmar cita |
| `PUT`  | `/api/appointments/{id}/complete` | Marcar como atendida |

### Historia clinica e incapacidades

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/medical-records` | Crear registro medico (medico) |
| `GET`  | `/api/medical-records/my-records` | Mis registros (paciente) |
| `GET`  | `/api/medical-records/patient/{id}` | Registros de un paciente |
| `POST` | `/api/disabilities` | Crear incapacidad (medico) |
| `GET`  | `/api/disabilities/my-disabilities` | Mis incapacidades (paciente) |

### Chat y usuarios

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/chat/send` | Enviar mensaje |
| `GET`  | `/api/chat/conversation/{id}` | Historial de conversacion |
| `GET`  | `/api/chat/contacts` | Lista de contactos |
| `GET`  | `/api/users/profile` | Perfil del usuario autenticado |
| `GET`  | `/api/users/doctors` | Lista de medicos |
| `GET`  | `/api/users/patients` | Lista de pacientes |

---

## Flujo de autenticacion

```
1. POST /api/auth/login  →  { token, id, name, role, ... }
2. Frontend guarda token en localStorage
3. Axios adjunta: Authorization: Bearer <token> en cada request
4. JwtFilter valida el token antes de cada endpoint protegido
5. Si el token expira (401) → redirige automaticamente a /login
```

---

## Autor

Desarrollado por **Ana Mestra** como proyecto de desarrollo fullstack.

Estudiante de Tecnica en desarrollo de software— enfoque en desarrollo backend con Java Spring Boot y ciberseguridad.

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/)

---

<div align="center">
<sub>Construido con Java Spring Boot + React · 2026</sub>
</div>
