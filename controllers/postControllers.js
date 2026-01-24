import {
    Usuario,
    Deuda,
    Abono,
    sequelize
} from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email y contraseña son requeridos"
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                email
            }
        });

        if (!usuario) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const isMatch = await bcrypt.compare(password, usuario.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }

        // Create JWT
        const token = jwt.sign({
            id: usuario.id_usuario,
            email: usuario.email
        }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '1h'
        });

        res.json({
            message: "Login exitoso",
            token,
            user: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                moneda_preferida: usuario.moneda_preferida
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error en el servidor"
        });
    }
}

const register = async (req, res) => {
    try {
        const {
            nombre,
            email,
            password,
        } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        const existingUser = await Usuario.findOne({
            where: {
                email
            }
        });
        if (existingUser) {
            return res.status(400).json({
                message: "El email ya está registrado"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await Usuario.create({
            nombre,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Usuario creado exitosamente",
            user: {
                id_usuario: newUser.id_usuario,
                nombre: newUser.nombre,
                email: newUser.email,
                moneda_preferida: newUser.moneda_preferida
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al registrar usuario"
        });
    }
}

// Crear nueva deuda
const createDeuda = async (req, res) => {
    try {
        const {
            id_usuario,
            descripcion,
            acreedor,
            monto_total,
            moneda,
            fecha_pago_objetivo,
            recordatorio,
            interes_aplicado,
            tasa_interes
        } = req.body;

        if (!id_usuario || !monto_total || !moneda) {
            return res.status(400).json({
                message: "Usuario, monto y moneda son requeridos"
            });
        }

        // Calcular monto de interés
        const monto_interes = interes_aplicado && tasa_interes ?
            parseFloat(monto_total) * (parseFloat(tasa_interes) / 100) :
            0;

        const newDeuda = await Deuda.create({
            id_usuario,
            descripcion: descripcion || '',
            acreedor: acreedor || '',
            monto_total: parseFloat(monto_total),
            moneda,
            fecha_registro: new Date(),
            fecha_pago_objetivo: fecha_pago_objetivo || null,
            estado_pago: 'pendiente',
            recordatorio: recordatorio || false,
            interes_aplicado: interes_aplicado || false,
            tasa_interes: tasa_interes ? parseFloat(tasa_interes) : null,
            monto_interes
        });

        res.status(201).json({
            message: "Deuda creada exitosamente",
            deuda: newDeuda
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al crear la deuda"
        });
    }
}

// Actualizar deuda existente
const updateDeuda = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            descripcion,
            acreedor,
            monto_total,
            moneda,
            fecha_pago_objetivo,
            estado_pago,
            recordatorio,
            interes_aplicado,
            tasa_interes
        } = req.body;

        const deuda = await Deuda.findByPk(id);

        if (!deuda) {
            return res.status(404).json({
                message: "Deuda no encontrada"
            });
        }

        // Calcular monto de interés si aplica
        const monto_interes = interes_aplicado && tasa_interes ?
            parseFloat(monto_total || deuda.monto_total) * (parseFloat(tasa_interes) / 100) :
            0;

        await deuda.update({
            descripcion: descripcion !== undefined ? descripcion : deuda.descripcion,
            acreedor: acreedor !== undefined ? acreedor : deuda.acreedor,
            monto_total: monto_total ? parseFloat(monto_total) : deuda.monto_total,
            moneda: moneda !== undefined ? moneda : deuda.moneda,
            fecha_pago_objetivo: fecha_pago_objetivo !== undefined ? fecha_pago_objetivo : deuda.fecha_pago_objetivo,
            estado_pago: estado_pago !== undefined ? estado_pago : deuda.estado_pago,
            recordatorio: recordatorio !== undefined ? recordatorio : deuda.recordatorio,
            interes_aplicado: interes_aplicado !== undefined ? interes_aplicado : deuda.interes_aplicado,
            tasa_interes: tasa_interes ? parseFloat(tasa_interes) : deuda.tasa_interes,
            monto_interes
        });

        res.json({
            message: "Deuda actualizada exitosamente",
            deuda
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la deuda"
        });
    }
}

// Eliminar deuda
const deleteDeuda = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        const deuda = await Deuda.findByPk(id);

        if (!deuda) {
            return res.status(404).json({
                message: "Deuda no encontrada"
            });
        }

        // Eliminar abonos asociados primero
        await Abono.destroy({
            where: {
                id_deuda: id
            }
        });

        await deuda.destroy();

        res.json({
            message: "Deuda eliminada exitosamente"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la deuda"
        });
    }
}

// Crear nuevo abono
const createAbono = async (req, res) => {
    try {
        const {
            id_deuda,
            monto_abonado,
            moneda,
            tipo_cambio,
            nota
        } = req.body;

        if (!id_deuda || !monto_abonado || !moneda) {
            return res.status(400).json({
                message: "Deuda, monto y moneda son requeridos"
            });
        }

        // Verificar que la deuda existe
        const deuda = await Deuda.findByPk(id_deuda);
        if (!deuda) {
            return res.status(404).json({
                message: "Deuda no encontrada"
            });
        }

        // Calcular el saldo actual de la deuda
        const abonosExistentes = await Abono.findAll({
            where: {
                id_deuda
            }
        });

        const totalAbonado = abonosExistentes.reduce((sum, a) => sum + parseFloat(a.monto_abonado), 0);
        const montoConInteres = deuda.interes_aplicado ?
            parseFloat(deuda.monto_total) + parseFloat(deuda.monto_interes || 0) :
            parseFloat(deuda.monto_total);

        const saldoActual = montoConInteres - totalAbonado;
        // Usamos redondeo a 2 decimales para evitar problemas de precisión de punto flotante
        const nuevoRestante = Math.round((saldoActual - parseFloat(monto_abonado)) * 100) / 100;

        const newAbono = await Abono.create({
            id_deuda,
            fecha_abono: new Date(),
            monto_abonado: parseFloat(monto_abonado),
            moneda,
            tipo_cambio: tipo_cambio ? parseFloat(tipo_cambio) : 1,
            restante_actual: nuevoRestante > 0 ? nuevoRestante : 0,
            nota: nota || ""
        });

        // Actualizar estado de la deuda basado en el nuevo saldo
        const nuevoEstado = nuevoRestante <= 0 ? 'pagada' : 'en_progreso';
        await deuda.update({
            estado_pago: nuevoEstado
        });

        res.status(201).json({
            message: "Abono registrado exitosamente",
            abono: newAbono,
            nuevo_saldo: nuevoRestante > 0 ? nuevoRestante : 0,
            estado_deuda: nuevoEstado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al registrar el abono"
        });
    }
}

export {
    login,
    register,
    createDeuda,
    updateDeuda,
    deleteDeuda,
    createAbono
};