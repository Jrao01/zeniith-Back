import {
    DataTypes
} from 'sequelize';
import sequelize from '../config/db.js';

const Abono = sequelize.define('Abono', {
    id_abono: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_deuda: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_abono: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    monto_abonado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    moneda: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    tipo_cambio: {
        type: DataTypes.DECIMAL(8, 4),
        allowNull: true
    },
    restante_actual: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    }
}, {
    tableName: 'Abonos',
    timestamps: false
});

export default Abono;