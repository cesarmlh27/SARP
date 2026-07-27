# SAPR - Sistema Administrativo Profesional para Restaurante

SAPR es un sistema administrativo para **un restaurante fisico** (single-tenant), con enfoque operativo real:
- salon (mesas y pedidos)
- cocina (comandas digitales)
- caja (pagos)
- administracion (usuarios, productos, reportes)

El sistema esta preparado para crecimiento a multiples sucursales en el futuro, sin implementar aun arquitectura multiempresa.

## 1. Enfoque del proyecto

Este proyecto **no es SaaS multiempresa**.

Reglas de negocio actuales:
- No hay registro publico de usuarios.
- Gestion de personal interno por roles operativos (admin, caja, cocina, mesero).
- Se mantiene recuperacion de contrasena.
- Pedidos y comandas se manejan como un flujo unificado del mismo ciclo operativo.
- Productos sin control de stock (solo estado activo/inactivo).

## 2. Stack tecnologico

### Backend
- Java 21
- Spring Boot 4.1
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Maven Wrapper (`mvnw`)

### Frontend
- React 19 + TypeScript
- Vite
- Material UI
- TanStack Query
- React Hook Form + Zod
- Axios

## 3. Estructura del repositorio

```text
SAPR/
  backend/     # API REST, seguridad, logica de negocio, persistencia
  frontend/    # SPA administrativa
```

Arquitectura backend por modulos: controller, service, repository, entity, dto.

## 4. Modulos funcionales

- Autenticacion y seguridad (JWT)
- Usuarios y roles internos
- Mesas
- Pedidos
- Comandas digitales (cocina)
- Productos y categorias
- Pagos
- Dashboard y reportes base

## 5. Flujo unificado Pedidos + Comandas

En SAPR, una comanda es la representacion de cocina de un pedido.

### Flujo operativo
1. Se crea un pedido para una mesa disponible.
2. Se agregan items a la comanda (productos y cantidades).
3. Cocina toma la comanda y cambia estado.
4. Salon entrega al cliente.
5. Caja registra el pago.

### Estados del pedido
- `PENDING` -> `IN_PROGRESS` -> `READY` -> `DELIVERED` -> `PAID`
- Cancelacion permitida solo en etapas controladas.
- No se permite pasar a `IN_PROGRESS` sin items en la comanda.

## 6. Seguridad y control de acceso

- Endpoints publicos:
  - `POST /api/auth/login`
  - `POST /api/auth/recover-password`
  - `POST /api/auth/reset-password`
- Endpoints protegidos por rol para operaciones internas.

### Matriz de permisos actual
- `ADMIN`: acceso total.
- `CAJERO`: acceso total operativo y administrativo.
- `COCINA`: solo visualiza pedidos activos y puede pasarlos a `IN_PROGRESS`.
- `MESERO`: crea pedidos, edita comandas, cancela pedidos propios y visualiza solo pedidos activos propios.

### Comportamiento UX para evitar 403
- Los modulos no permitidos se ocultan en el menu segun rol.
- Si el usuario intenta abrir una ruta no permitida manualmente, la UI muestra "Sin privilegios".

## 7. Ejecucion local

## Requisitos
- Java 21
- Node.js 18+
- Docker (opcional)
- PostgreSQL en `localhost:5432`

Configuracion DB por defecto (backend):
- DB: `sapr_db`
- User: `user_sapr`
- Password: `1234`

### 7.1 Levantar backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend:
- API base: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/swagger-ui`

### 7.2 Levantar frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend:
- `http://localhost:5173`

### 7.3 Build de validacion

```powershell
# frontend
cd frontend
npm run build

# backend
cd backend
.\mvnw.cmd -DskipTests compile
```

## 8. Ejecucion con Docker (backend + db)

Desde `backend/`:

```powershell
docker compose up --build
```

Luego levantar frontend en local (`npm run dev`).

## 9. Usuario inicial de desarrollo

Se crea automaticamente un administrador en arranque (si no existe):
- Email: `admin@sapr.com`
- Password: `Admin1234!`

Usar solo en entorno de desarrollo.

## 10. Variables de entorno importantes

Backend (`application.properties`):
- `SPRING_PROFILES_ACTIVE` (default `dev`)
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `CORS_ALLOWED_ORIGINS`
- `APP_FRONTEND_URL`
- `MAIN_ADMIN_EMAIL`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`

Frontend:
- `VITE_API_URL` (default `http://localhost:8080/api`)

## 11. Pantallas clave del frontend

- Login y recuperacion de contrasena
- Pedidos y comandas (unificados en un mismo modulo con tabs)
- Mesas
- Productos / categorias
- Pagos
- Usuarios / roles
- Dashboard / reportes

## 12. Imagenes de productos

- Upload por endpoint: `POST /api/products/{id}/image`.
- Render por endpoint: `GET /api/products/{id}/image`.
- El frontend agrega versionado en query string para evitar cache y reflejar la imagen recien subida.

## 13. Buenas practicas aplicadas

- Separacion por capas (controller/service/repository)
- DTOs para contratos de API
- Validaciones de flujo operativo
- Control de permisos por endpoint y rol
- Frontend desacoplado por servicios + hooks + feature folders
- Manejo centralizado de errores en UI

## 14. Roadmap sugerido

- Inventario real (si se decide reintroducir stock)
- Impresion termica de comanda (cocina)
- Reportes avanzados por fecha/turno/empleado
- Preparacion para sucursales (branch-aware) sin romper modelo single-tenant

---

Proyecto desarrollado como base profesional para portafolio, enfocado en necesidades reales de operacion de restaurante.
