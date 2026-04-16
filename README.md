# 🏢 Plataforma Intranet Modular + Power BI

## 📌 Descripción

Plataforma intranet corporativa modular que permite:

- Gestión de usuarios y perfiles
- Navegación dinámica (sin hardcodeo)
- Integración con Power BI Embedded
- Administración centralizada
- Escalabilidad para nuevos módulos (Planeamiento, Compras, etc.)

---

## 🎯 Objetivo

Construir una base tecnológica escalable donde:

- El menú es dinámico (desde BD)
- Los módulos son configurables
- Los dashboards son administrables
- Los permisos son controlados por backend

---

## 🧱 Arquitectura

### Tipo
Modular Monolith

### Stack

- Next.js (App Router)
- React + TypeScript
- PostgreSQL
- Tailwind CSS
- Prisma / Drizzle
- Power BI Embedded

---

## 📂 Estructura del proyecto
src/
app/
login/
forgot-password/
reset-password/
intranet/
layout.tsx
page.tsx
module/
bi/
admin/
api/

modules/
auth/
users/
profiles/
navigation/
permissions/
powerbi/
audit/

components/
sidebar/
header/
layout/

lib/
db/
auth/
permissions/
powerbi/


---

## 🧠 Modelo de datos

### Entidades principales

- users
- profiles
- modules
- resources
- profile_modules
- profile_resources
- password_reset_tokens
- audit_log

---

## 🔐 Seguridad

- Hash de contraseñas (bcrypt / argon2)
- Tokens de recuperación de un solo uso
- Validación backend de permisos
- No exponer lógica crítica en frontend

---

## 🧭 Navegación dinámica

El menú se construye desde BD según:

- usuario
- perfiles
- módulos asignados
- recursos asignados

---

## 📊 Integración Power BI

Flujo:

1. Usuario abre dashboard
2. Backend valida permisos
3. Backend genera embed token
4. Frontend renderiza

---

## 🚀 Roadmap

### Fase 1
- Auth
- Usuarios
- Perfiles
- Menú dinámico

### Fase 2
- Recursos
- Permisos
- Admin panel

### Fase 3
- Power BI Embedded

### Fase 4
- Auditoría
- Optimización

---

## ⚙️ Reglas importantes

- ❌ No hardcodear módulos
- ❌ No hardcodear dashboards
- ❌ No confiar en permisos frontend
- ✅ Todo configurable desde BD
- ✅ Arquitectura limpia

---

## ▶️ Ejecución

```bash
npm install
npm run dev