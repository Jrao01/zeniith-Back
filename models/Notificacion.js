import {
    DataTypes
} from 'sequelize';
import sequelize from '../config/db.js';

const Notificacion = sequelize.define('Notificacion', {
    id_notificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_deuda: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_programada: {
        type: DataTypes.DATE, // datetime
        allowNull: false
    },
    enviada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Notificaciones',
    timestamps: false
});

export default Notificacion;