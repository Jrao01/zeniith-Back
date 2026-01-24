# Zenith Finance API - Backend ⚙️

Este es el motor central de la plataforma Zenith Finance. Una API robusta diseñada para gestionar usuarios, deudas y abonos con integridad referencial y cálculos automatizados en base de datos.

## 🛠️ Tecnologías

- **Runtime**: [Node.js](https://nodejs.org/) (Versión 18+)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Sequelize](https://sequelize.org/)
- **Base de Datos**: [SQLite](https://www.sqlite.org/) (Rápido, portátil y sin configuración externa necesaria).
- **Seguridad**: [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) para hashing de contraseñas y [jsonwebtoken (JWT)](https://jwt.io/) para autenticación.
- **Logging**: [Morgan](https://github.com/expressjs/morgan) para rastreo de peticiones.

## 📡 Endpoints Disponibles

### Autenticación

- `POST /register`: Registro de nuevos usuarios.
- `POST /login`: Inicio de sesión y retorno de token JWT.

### Deudas (`/deudas`)

- `GET /deudas/usuario/:id_usuario`: Obtiene todas las deudas de un usuario con totales calculados (total pagado, cantidad de abonos).
- `GET /deudas/:id`: Detalle de una deuda específica.
- `POST /deudas`: Crea una nueva deuda (soporta intereses y recordatorios).
- `PUT /deudas/:id`: Actualiza datos de una deuda existente.
- `DELETE /deudas/:id`: Elimina una deuda y sus abonos asociados de forma segura.

### Abonos (`/abonos`)

- `GET /abonos?id_usuario=X`: Historial completo de pagos de un usuario específico.
- `GET /abonos/deuda/:id_deuda`: Lista de abonos aplicados a una deuda en particular.
- `POST /abonos`: Registra un nuevo abono. Calcula automáticamente el nuevo saldo y actualiza el estado de la deuda a "pagada" si el saldo llega a cero.

### Dashboard

- `GET /dashboard/:id_usuario`: Retorna estadísticas agregadas optimizadas (Total deudas, total abonado, porcentaje de avance, conteo de deudas activas).

## 🚀 Configuración e Inicio

1. **Instalar dependencias**:

   ```bash
   cd zenith-Back
   npm install
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env` en la raíz con el siguiente contenido:

   ```env
   PORT=3000
   JWT_SECRET=tu_secreto_super_seguro
   ```

3. **Base de Datos**:
   Al iniciar el servidor por primera vez, SQLite creará automáticamente el archivo `config/base.db`. No se requiere configuración de servidor externa.

4. **Corre el servidor**:

   ```bash
   # Desarrollo (con nodemon)
   npm run dev

   # Producción
   npm start
   ```

## 🧠 Lógica de Negocio Automática

- **Integridad de Datos**: Al borrar una deuda, todos sus abonos asociados se eliminan en cascada.
- **Cambio de Estados**: Al registrar un abono, el backend verifica el saldo en tiempo real. Si el acumulado iguala o supera el monto total + intereses, el campo `estado_pago` de la deuda cambia a `pagada`.
- **Cálculo Optimizado**: Las estadísticas del dashboard y listas utilizan subconsultas SQL directamente en la base de datos para garantizar rapidez incluso con miles de registros.
