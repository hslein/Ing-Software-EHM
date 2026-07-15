# Sistema de Agendamiento y Confirmación de Correos

## 📋 Resumen

Se ha implementado un sistema completo de agendamiento de citas con envío automático de correos de confirmación. El sistema funciona de la siguiente forma:

1. El usuario solicita una cita a través del endpoint `POST /api/appointments`
2. La cita se registra en Firestore de forma segura (usando transacciones)
3. El servidor responde inmediatamente al cliente
4. **De forma asincrónica** (en background), se envía un email HTML personalizado al usuario
5. El cliente nunca espera por el envío del email

## 🚀 Características

- ✅ **No bloquea la respuesta**: El email se envía en background sin esperar
- ✅ **Plantilla HTML profesional**: Email hermoso y responsivo
- ✅ **Datos de la cita**: Incluye marca, modelo, fecha, hora y motivo
- ✅ **Transacciones Firestore**: Evita conflictos y datos inconsistentes
- ✅ **Gestión de errores**: Logging detallado en caso de fallos
- ✅ **Flexible**: Soporta múltiples proveedores SMTP

## 📝 Archivos Creados

```
apps/ehm_back/src/
├── email/
│   ├── email.module.ts          # Módulo de email
│   └── email.service.ts         # Servicio con lógica de envío
│
├── appointments/
│   ├── appointments.module.ts   # Módulo de agendamiento
│   ├── appointments.controller.ts # Controlador REST
│   ├── appointments.service.ts  # Lógica de agendamiento
│   └── dto/
│       └── create-appointment.dto.ts # DTO de validación
```

## 🔧 Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_o_app_token
EMAIL_FROM=noreply@concesionario.com
```

### 2. Proveedores SMTP Recomendados (Desarrollo/Producción)

#### Gmail
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App Password (con 2FA habilitado)
```

#### Mailtrap (Recomendado para desarrollo)
```
SMTP_HOST=send.mailtrap.io
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu_username
SMTP_PASSWORD=tu_token
```

#### SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxx
```

## 📡 Endpoints

### Crear Cita
```http
POST /api/appointments
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "slotId": "20260601-1430",
  "marca": "Toyota",
  "modelo": "Corolla",
  "motivo": "Prueba de manejo"
}
```

**Respuesta (200):**
```json
{
  "appointmentId": "abc123def456",
  "message": "Cita registrada exitosamente. Un email de confirmación será enviado en breve."
}
```

### Obtener Citas del Usuario
```http
GET /api/appointments
Authorization: Bearer <firebase-token>
```

### Cancelar Cita
```http
DELETE /api/appointments/:id
Authorization: Bearer <firebase-token>
```

## 📧 Correo de Confirmación

El email incluye:
- ✓ Confirmación de cita registrada
- ✓ Datos del vehículo (marca y modelo)
- ✓ Fecha de la cita
- ✓ Hora de la cita
- ✓ Motivo de la cita
- ✓ Instrucciones para llegar 10 minutos antes
- ✓ Diseño HTML profesional y responsivo

## 🔄 Flujo de Ejecución (Asincrónico)

```
Cliente solicita cita
        ↓
Backend valida
        ↓
Firestore registra cita (transacción)
        ↓
Responde al cliente (200 OK) ← Aquí termina la solicitud del cliente
        ↓
Background: Obtiene detalles completos de Firestore
        ↓
Background: Envía email HTML
        ↓
Background: Log de resultado (éxito o error)
```

## 🛡️ Seguridad

- ✅ Autenticación Firebase obligatoria (`FirebaseAuthGuard`)
- ✅ Usuarios solo pueden obtener/cancelar sus propias citas
- ✅ Transacciones Firestore evitan race conditions
- ✅ Email extraído de `req.user.email` (verificado por Firebase)
- ✅ Validación de DTOs con `class-validator`

## 🐛 Logs y Debugging

Para verificar envío de emails, revisa los logs:

```bash
# En desarrollo
npm run serve ehm_back

# Busca logs como:
# [EmailService] Email de confirmación enviado a user@example.com
# [EmailService] Error enviando email a user@example.com
```

## 📌 Integración con Frontend

Si quieres llamar este endpoint desde el frontend:

```typescript
async function scheduleAppointment(appointmentData) {
  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        slotId: appointmentData.slotId,
        marca: appointmentData.marca,
        modelo: appointmentData.modelo,
        motivo: appointmentData.motivo
      })
    });

    const result = await response.json();
    console.log('Cita registrada:', result.appointmentId);
    // Usuario verá confirmación inmediata
    // Email será enviado en background
  } catch (error) {
    console.error('Error al agendar:', error);
  }
}
```

## ⚠️ Consideraciones Importantes

1. **Timeouts**: Si el proceso de envío demora, no afectará al usuario
2. **Fallos de Email**: Se registran en logs pero no rompen la operación
3. **Sin Reintentos**: Los emails fallidos no se reintentarán automáticamente
4. **Rate Limiting**: Considera agregar límites si hay muchos usuarios
5. **Credenciales**: **Nunca** commits `.env` - usa variables de entorno

## 🚀 Próximas Mejoras (Opcionales)

- Agregar reintentos automáticos para emails fallidos
- Queue de emails (Redis/Bull)
- Plantillas de email más personalizadas por dealer
- SMS opcional como alternativa a email
- Webhook para tracking de emails enviados

---

**¡Sistema listo para usar! 🎉**
