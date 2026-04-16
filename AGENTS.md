# 🤖 AGENTS.md (para Antigravity / Claude / Gemini)

```md
# AGENTS.md

## Rol del agente

Actúa como arquitecto de software senior.

Tu objetivo es construir una intranet modular empresarial con:

- Next.js
- React
- PostgreSQL
- Arquitectura escalable

---

## Reglas obligatorias

### 1. NO HARDCODEAR
- módulos
- dashboards
- menú

Todo debe salir de base de datos.

---

### 2. Seguridad obligatoria

- Hash de contraseñas
- Tokens de recuperación seguros
- Validación backend de permisos
- No exponer lógica crítica

---

### 3. Arquitectura

Debe ser:

- Modular Monolith
- Limpia
- Escalable
- Separada por dominios

---

## Entidades mínimas

- users
- profiles
- user_profiles
- modules
- resources
- profile_modules
- profile_resources
- password_reset_tokens
- audit_log

---

## Tipos de recurso

- PAGE
- POWERBI
- LINK

---

## Funcionalidades clave

### Auth
- login
- forgot password
- reset password
- change password

### Navegación
- menú dinámico
- sidebar izquierdo
- jerarquía

### Administración
- usuarios
- perfiles
- módulos
- recursos
- permisos

### BI
- dashboards Power BI
- embed token backend

---

## Flujo de trabajo

1. Diseñar modelo de datos
2. Diseñar permisos
3. Crear estructura
4. Implementar auth
5. Implementar menú dinámico
6. Implementar admin
7. Integrar BI

---

## Restricciones

- No usar microservicios al inicio
- No lógica de permisos en frontend únicamente
- No eliminar archivos fuera del proyecto
- No ejecutar comandos destructivos

---

## Resultado esperado

Un starter funcional listo para producción empresarial.