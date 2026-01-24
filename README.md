# Zenith Finance API - Backend ⚙️

Este es el motor central de la plataforma Zenith Finance. Una API robusta diseñada para gestionar usuarios, deudas y abonos con integridad referencial y cálculos automatizados en base de datos.

## 🛠️ Tecnologías

- **Runtime**: Node.js (Versión 18+)
- **Framework**: Express.js
- **ORM**: Sequelize
- **Base de Datos**: SQLite (almacenada en `config/base.db`)

---

## 📡 Referencia de API

### 🔐 Autenticación

#### `POST /register`

Registra un nuevo usuario en el sistema.

- **Body (JSON)**:
  - `nombre`: string (obligatorio)
  - `email`: string (obligatorio, único)
  - `password`: string (obligatorio)
- **Respuesta (201)**:
  - `{ message, user: { id_usuario, nombre, email }, token }`

#### `POST /login`

Inicia sesión y genera un token de acceso.

- **Body (JSON)**:
  - `email`: string (obligatorio)
  - `password`: string (obligatorio)
- **Respuesta (200)**:
  - `{ message, user: { id_usuario, nombre, email, moneda_preferida }, token }`

---

### 💳 Deudas

#### `GET /deudas/usuario/:id_usuario`

Obtiene la lista de deudas de un usuario con métricas calculadas.

- **Params**: `id_usuario` (ID del usuario)
- **Respuesta (200)**:
  - `deudas`: Array de objetos Deuda. Incluye campos virtuales:
    - `total_abonado`: Suma de todos los abonos realizados.
    - `abonos_count`: Cantidad de pagos registrados.

#### `GET /deudas/:id`

Detalle de una deuda específica incluyendo su historial de abonos.

- **Params**: `id` (ID de la deuda)
- **Respuesta (200)**:
  - `{ message, deuda: { ..., Abonos: [...] } }`

#### `POST /deudas`

Crea una nueva deuda.

- **Body (JSON)**:
  - `id_usuario`: integer (obligatorio)
  - `descripcion`: string (obligatorio)
  - `acreedor`: string (opcional)
  - `monto_total`: number (obligatorio)
  - `moneda`: string (ej: "USD", "MXN") (obligatorio)
  - `fecha_pago_objetivo`: date (YYYY-MM-DD)
  - `interes_aplicado`: boolean
  - `tasa_interes`: number (porcentaje)
- **Respuesta (201)**:
  - `{ message, deuda: { ... } }`

#### `PUT /deudas/:id`

Actualiza campos de una deuda.

- **Body**: Campos parciales del modelo Deuda.
- **Respuesta (200)**: `{ message, deuda }`

#### `DELETE /deudas/:id`

Elimina la deuda y todos sus abonos en cascada.

- **Respuesta (200)**: `{ message: "Deuda eliminada exitosamente" }`

---

### 💰 Abonos

#### `GET /abonos`

Lista de abonos filtrable.

- **Query Params**:
  - `id_usuario`: ID del usuario propietario de las deudas (Recomendado).
  - `id_deuda`: Para filtrar abonos de una deuda específica.
- **Respuesta (200)**:
  - `{ message, count, abonos: [{ ..., Deuda: { descripcion, moneda } }] }`

#### `POST /abonos`

Registra un nuevo pago.

- **Body (JSON)**:
  - `id_deuda`: integer (obligatorio)
  - `monto_abonado`: number (obligatorio)
  - `moneda`: string (obligatorio)
  - `tipo_cambio`: number (default: 1.0)
  - `nota`: string (opcional)
- **Lógica Interna**: Si el saldo llega a 0, la deuda cambia automáticamente a estado `pagada`.
- **Respuesta (201)**:
  - `{ message, abono, nuevo_saldo, estado_deuda }`

---

### 📊 Dashboard

#### `GET /dashboard/:id_usuario`

Resumen estadístico optimizado para la pantalla principal.

- **Respuesta (200)**:
  - `data`: {
    - `total_deudas`: Suma de montos base + intereses.
    - `total_abonado`: Suma de todos los pagos realizados.
    - `saldo_pendiente`: Diferencia monetaria.
    - `deudas_pendientes`: Conteo de deudas activas.
    - `deudas_pagadas`: Conteo de deudas finalizadas.
      }

---

## 🚀 Configuración e Inicio

1. **Instalar dependencias**: `npm install`
2. **Setup .env**:
   ```env
   PORT=3000
   JWT_SECRET=tu_secreto
   ```
3. **Inicio**: `npm run dev`
