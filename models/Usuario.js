import {
    DataTypes
} from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    moneda_preferida: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "USD"
    }
}, {
    tableName: 'Usuarios',
    timestamps: false
});

export default Usuario;