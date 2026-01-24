import {
    DataTypes
} from 'sequelize';
import sequelize from '../config/db.js';

const Deuda = sequelize.define('Deuda', {
    id_deuda: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    acreedor: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    monto_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    moneda: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    fecha_registro: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fecha_pago_objetivo: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    estado_pago: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pendiente'
    },
    recordatorio: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    interes_aplicado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tasa_interes: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    monto_interes: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    }
}, {
    tableName: 'Deudas',
    timestamps: false
});

export default Deuda;