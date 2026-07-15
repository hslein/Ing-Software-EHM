# Guía de Prueba - Sistema de Agendamiento y Email

## ⚡ Prueba Rápida

### 1. Configurar Variables de Entorno

En `apps/ehm_back/.env`, agrega:

```bash
# Gmail (opción más fácil)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
EMAIL_FROM=noreply@concesionario.com
```

**Para Gmail con 2FA:**
1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Crea una contraseña de aplicación
3. Copia los 16 caracteres (sin espacios) al `SMTP_PASSWORD`

### 2. Iniciar Backend

```bash
cd /Users/davidvalencia/Documents/2026/ing_soft/Ing-Software-EHM
npx nx serve ehm_back
```

Espera hasta ver:
```
Listening on localhost:3000
```

### 3. Probar con cURL

```bash
# Primero obtén un token de Firebase
# Luego reemplaza YOUR_TOKEN

curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "20260601-1430",
    "marca": "Toyota",
    "modelo": "Corolla",
    "motivo": "Prueba de manejo"
  }'
```

### 4. Respuesta Esperada

```json
{
  "appointmentId": "abc123def456xyz",
  "message": "Cita registrada exitosamente. Un email de confirmación será enviado en breve."
}
```

### 5. Ver Email (Mailtrap - Recomendado para Desarrollo)

Si usas Mailtrap:
1. Crea cuenta en [mailtrap.io](https://mailtrap.io)
2. Configura `.env`:

```bash
SMTP_HOST=send.mailtrap.io
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=xxxxxxxxxxxx  # De Mailtrap
SMTP_PASSWORD=xxxxxxxxxxxx  # De Mailtrap
EMAIL_FROM=noreply@concesionario.com
```

3. Los emails aparecerán en el inbox de Mailtrap en tiempo real

## 📋 Todos los Endpoints

### POST /api/appointments (Crear Cita)
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "20260601-1430",
    "marca": "Toyota",
    "modelo": "Corolla",
    "motivo": "Prueba de manejo"
  }'
```

### GET /api/appointments (Listar Citas del Usuario)
```bash
curl http://localhost:3000/api/appointments \
  -H "Authorization: Bearer TOKEN"
```

### DELETE /api/appointments/:id (Cancelar Cita)
```bash
curl -X DELETE http://localhost:3000/api/appointments/abc123def456xyz \
  -H "Authorization: Bearer TOKEN"
```

## 🔍 Debugging

### Ver logs del servicio de email:
```
[EmailService] Email de confirmación enviado a user@example.com
```

### Ver logs del servicio de agendamiento:
```
[AppointmentsService] Cita registrada
```

### Si el email no llega:
1. Verifica que `SMTP_USER` y `SMTP_PASSWORD` sean correctos
2. Revisa logs: `npm run serve ehm_back` (debe mostrar cualquier error)
3. Si usas Gmail, asegúrate de habilitar "Aplicaciones menos seguras"
4. Prueba con Mailtrap (más fácil para desarrollo)

## 🧪 Prueba End-to-End

1. Inicia el backend: `npx nx serve ehm_back`
2. Obtén un token de Firebase (del frontend cuando inicias sesión)
3. Copia el token y úsalo en cURL arriba
4. Verifica que aparezca el email en Mailtrap (si lo usas)
5. Revisa la colección "appointments" en Firestore
6. Verifica que la colección "bookedSlots" tenga el slot marcado

## ❓ Preguntas Frecuentes

**P: ¿El email se envía inmediatamente?**
R: No, se envía en background sin bloquear. El usuario recibe la respuesta al instante.

**P: ¿Qué pasa si falla el email?**
R: Se registra en logs pero la cita ya está confirmada. El usuario no lo verá.

**P: ¿Puedo cambiar la plantilla del email?**
R: Sí, edita `email.service.ts` en el método `generateAppointmentTemplate()`

**P: ¿Funciona en producción?**
R: Sí, solo cambia las variables de entorno al servidor SMTP real de producción.

---

**¡Listo para probar! 🚀**
