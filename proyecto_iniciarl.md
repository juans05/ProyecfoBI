# Proyecto: Plataforma Intranet Modular con Power BI

## Rol
Actúa como un arquitecto de software senior y lead engineer especializado en:
- Next.js
- React
- TypeScript
- PostgreSQL
- Arquitectura modular escalable
- Seguridad empresarial
- Integración con Power BI Embedded

Tu objetivo es diseñar y construir la base técnica de una plataforma intranet corporativa modular, dinámica, escalable y segura.

---

## Contexto de negocio

Se requiere una plataforma intranet con menú lateral izquierdo tipo portal corporativo, donde los usuarios puedan ingresar con correo y contraseña, y según su perfil puedan visualizar determinados módulos y dashboards de Power BI.

La plataforma debe permitir crecer e integrar nuevos desarrollos internos como:
- Planeamiento
- Dosimetría
- Compras
- Almacén
- Otros sistemas futuros

Power BI será un módulo más dentro de la intranet, no el único objetivo del sistema.

---

## Requisitos obligatorios

### 1. Navegación dinámica
El menú y los módulos NO deben estar hardcodeados.
Todo debe administrarse desde base de datos o desde el mismo sistema.

Debe poder configurarse dinámicamente:
- módulos
- submódulos
- recursos
- dashboards
- enlaces
- orden del menú
- íconos
- visibilidad
- estado activo/inactivo

### 2. Seguridad
Debe incluir:
- login con correo + contraseña
- recuperación de contraseña por correo
- cambio de contraseña desde el sistema
- opción de forzar cambio de contraseña
- validación backend de permisos
- contraseñas con hash seguro
- tokens de recuperación con expiración y un solo uso

### 3. Perfiles y permisos
El sistema debe soportar:
- usuarios
- perfiles
- múltiples perfiles por usuario
- asignación de módulos por perfil
- asignación de recursos por perfil
- permisos por acción:
  - ver
  - crear
  - editar
  - eliminar
  - exportar
  - administrar

### 4. Integración Power BI
Debe soportar:
- catálogo de dashboards
- asociación de dashboards a módulos
- control de acceso por perfil
- generación backend de embed token
- renderizado de dashboards en frontend

### 5. Escalabilidad
El sistema debe ser diseñado para:
- crecimiento de módulos futuros
- múltiples áreas o empresas
- alto nivel de mantenibilidad
- buen rendimiento
- arquitectura limpia y ordenada

---

## Stack requerido

- Frontend: React
- Framework fullstack: Next.js
- Lenguaje: TypeScript
- Base de datos: PostgreSQL

Puedes proponer librerías complementarias si ayudan, por ejemplo:
- Prisma o Drizzle
- Zod
- Auth.js o auth propia
- Tailwind CSS
- Zustand o TanStack Query
- Redis opcional

---

## Arquitectura requerida

Quiero una solución basada en:
- Modular Monolith bien estructurado
- Arquitectura limpia por dominios
- Separación de responsabilidades
- Preparada para evolucionar a microservicios si algún día se necesita

No quiero una solución improvisada ni centrada solo en “hacer que funcione”.
Debe ser arquitectura profesional, empresarial, escalable y mantenible.

---

## Lineamientos funcionales

### Menú lateral izquierdo
Debe existir un sidebar izquierdo persistente con:
- módulos visibles según permisos
- navegación jerárquica
- íconos configurables
- colapsable
- orden configurable
- compatibilidad con futuras secciones

### Tipos de recurso
El sistema debe soportar recursos de tipo:
- PAGE -> pantalla interna del sistema
- POWERBI -> dashboard embebido
- LINK -> enlace externo
- MODULE -> contenedor navegable
- FUTURE_APP -> placeholder para futuros desarrollos desacoplados

### Panel administrativo
Debe existir un panel para administrar:
- usuarios
- perfiles
- módulos
- submódulos
- recursos
- dashboards
- permisos
- auditoría básica
- configuración general

---

## Modelo de datos esperado

Diseña y genera el modelo PostgreSQL para entidades como mínimo:

- users
- profiles
- user_profiles
- modules
- resources
- profile_modules
- profile_resources
- password_reset_tokens
- audit_log

Si lo consideras correcto, agrega:
- tenants
- settings
- notifications
- sessions
- module_categories

Incluye:
- claves primarias
- claves foráneas
- índices
- restricciones
- timestamps
- campos de auditoría

---

## Backend esperado

Construye una API o capa backend en Next.js que permita al menos:

### Auth
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/change-password
- POST /api/auth/logout

### Users
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Profiles
- GET /api/profiles
- POST /api/profiles
- PUT /api/profiles/:id

### Modules
- GET /api/modules/menu
- GET /api/modules
- POST /api/modules
- PUT /api/modules/:id

### Resources
- GET /api/resources
- POST /api/resources
- PUT /api/resources/:id

### Permissions
- GET /api/permissions/by-profile/:profileId
- POST /api/permissions/assign

### Power BI
- GET /api/bi/embed-token/:resourceId

Todas las rutas deben validar permisos y usar buenas prácticas.

---

## Frontend esperado

Genera la base del frontend con:

- layout principal de intranet
- sidebar izquierdo dinámico
- header superior
- pantalla de login
- pantalla de forgot password
- pantalla de reset password
- dashboard home
- panel de administración
- vistas CRUD básicas para users/profiles/modules/resources
- pantalla de visualización Power BI

---

## Seguridad obligatoria

Implementa estas reglas:
- no guardar contraseñas en texto plano
- usar hashing seguro
- no exponer permisos sensibles en frontend sin validación backend
- los tokens de recuperación deben expirar
- los tokens de recuperación deben ser de un solo uso
- evitar enumeración de usuarios en forgot password
- proteger rutas privadas
- registrar auditoría mínima

---

## Rendimiento esperado

Diseña pensando en:
- caché de menú por usuario
- lazy loading de módulos
- carga diferida de dashboards
- no cargar múltiples dashboards pesados simultáneamente
- índices adecuados en PostgreSQL
- posibilidad de incorporar Redis

---

## Entregables esperados

Quiero que construyas y entregues, en este orden:

### Fase 1: Arquitectura
1. estructura de carpetas final
2. explicación de arquitectura
3. decisiones técnicas justificadas

### Fase 2: Base de datos
4. esquema PostgreSQL completo
5. migraciones
6. seeds mínimos

### Fase 3: Backend
7. capa de dominio
8. servicios
9. repositorios
10. endpoints API

### Fase 4: Frontend
11. layout de intranet
12. sidebar dinámico
13. login + forgot/reset password
14. CRUD de administración

### Fase 5: BI
15. integración Power BI Embedded
16. flujo para embed token
17. vista de dashboard

### Fase 6: Documentación
18. README técnico
19. pasos para correr localmente
20. notas de despliegue

---

## Forma de trabajo esperada

Trabaja así:
1. analiza primero
2. propone arquitectura
3. crea estructura de proyecto
4. implementa por capas
5. valida consistencia
6. documenta cada módulo importante

Antes de escribir mucho código, define claramente:
- modelo de datos
- flujo de autenticación
- resolución de permisos
- estructura del menú dinámico

---

## Restricciones importantes

- No hardcodear módulos ni dashboards
- No mezclar lógica de permisos en componentes sin validación backend
- No diseñar una arquitectura frágil
- No hacer microservicios innecesarios al inicio
- No usar patrones sobrecomplejos sin justificación
- No asumir datos ficticios sin documentarlos

---

## Requisito extra importante

Quiero que el sistema esté preparado para que en el futuro los módulos como Planeamiento, Dosimetría, Compras y Almacén puedan crecer sin rehacer toda la aplicación.

Por eso debes diseñar una base de intranet corporativa, no una simple web de reportes.

---

## Seguridad operativa del agente

No ejecutes comandos destructivos.
No elimines archivos fuera del proyecto.
No modifiques configuraciones sensibles del sistema operativo.
No borres carpetas, discos, cachés globales ni archivos de usuario.
Si necesitas limpiar algo, limita cualquier operación al workspace actual del proyecto y muestra exactamente qué harás antes.

---

## Resultado esperado

Quiero como resultado un starter profesional funcional, bien estructurado, con código base listo para evolucionar a producción.
Prioriza claridad, mantenibilidad, seguridad y escalabilidad.