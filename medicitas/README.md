# MediCitas

Sistema de reservas medicas desarrollado con React + Spring Boot + PostgreSQL.

## Tecnologias

**Frontend**
- React 18 + Vite
- React Router v6
- Axios con interceptores JWT

**Backend**
- Spring Boot 3.2
- Spring Security + JWT (JJWT 0.12.3)
- Spring Data JPA
- PostgreSQL

---

## Estructura del proyecto

```
medicitas/
├── frontend/
│   ├── src/
│   │   ├── api/          # axios.js, services.js
│   │   ├── components/   # Sidebar, Badge, Icons
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Login, Dashboard, Appointments, History, Notifications
│   │   └── styles/       # global.css
│   └── vite.config.js
└── backend/
    └── src/main/java/com/medicitas/
        ├── config/       # SecurityConfig
        ├── controller/   # Auth, Appointment, Notification
        ├── dto/          # Request y Response DTOs
        ├── entity/       # User, Appointment, Notification
        ├── repository/   # JPA Repositories
        ├── security/     # JwtService, JwtFilter
        └── service/      # Auth, Appointment, Notification
```

---

## Base de datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE medicitas;
```

Las tablas se crean automaticamente con `spring.jpa.hibernate.ddl-auto=update`.

Configurar credenciales en `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medicitas
spring.datasource.username=postgres
spring.datasource.password=postgres
```

---

## Correr el proyecto

**Backend**

```bash
cd backend
./mvnw spring-boot:run
```

El servidor queda en `http://localhost:8080`

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:3000`

El proxy de Vite redirige `/api/*` a `http://localhost:8080`.

---

## Endpoints

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Iniciar sesion |
| POST | /api/auth/register | No | Registrar paciente |
| GET | /api/appointments | Si | Listar citas del paciente |
| POST | /api/appointments | Si | Agendar nueva cita |
| DELETE | /api/appointments/{id} | Si | Cancelar cita |
| GET | /api/patients/{id}/history | Si | Historial medico |
| GET | /api/notifications | Si | Notificaciones del usuario |
| PUT | /api/notifications/read-all | Si | Marcar todas como leidas |

---

## Flujo de autenticacion

1. El usuario envia credenciales a `POST /api/auth/login`
2. El backend valida y retorna un `Bearer token` JWT
3. El frontend almacena el token en `localStorage`
4. Axios adjunta el token en cada request con el interceptor
5. Si el token expira (401), el interceptor redirige a `/login`
