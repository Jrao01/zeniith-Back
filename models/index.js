import Usuario from './Usuario.js';
import Deuda from './Deuda.js';
import Abono from './Abono.js';
import Notificacion from './Notificacion.js';
import sequelize from '../config/db.js';

// Define associations
Usuario.hasMany(Deuda, {
    foreignKey: 'id_usuario'
});
Deuda.belongsTo(Usuario, {
    foreignKey: 'id_usuario'
});

Usuario.hasMany(Notificacion, {
    foreignKey: 'id_usuario'
});
Notificacion.belongsTo(Usuario, {
    foreignKey: 'id_usuario'
});

Deuda.hasMany(Abono, {
    foreignKey: 'id_deuda',
    as: 'Abonos'
});
Abono.belongsTo(Deuda, {
    foreignKey: 'id_deuda'
});

Deuda.hasMany(Notificacion, {
    foreignKey: 'id_deuda',
    as: 'Notificaciones'
});
Notificacion.belongsTo(Deuda, {
    foreignKey: 'id_deuda'
});

export {
    Usuario,
    Deuda,
    Abono,
    Notificacion,
    sequelize
};