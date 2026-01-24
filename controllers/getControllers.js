import {
    Usuario,
    Deuda,
    Abono,
    sequelize
} from '../models/index.js';

// Obtener todas las deudas de un usuario con totales calculados mediante subconsultas
const getDeudas = async (req, res) => {
    try {
        const {
            id_usuario
        } = req.params;

        if (!id_usuario) {
            return res.status(400).json({
                message: "ID de usuario requerido"
            });
        }

        const deudas = await Deuda.findAll({
            where: {
                id_usuario
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(monto_abonado), 0)
                            FROM Abonos AS abonos_sub
                            WHERE abonos_sub.id_deuda = Deuda.id_deuda
                        )`),
                        'total_abonado'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Abonos AS abonos_sub
                            WHERE abonos_sub.id_deuda = Deuda.id_deuda
                        )`),
                        'abonos_count'
                    ]
                ]
            },
            order: [
                ['fecha_registro', 'DESC']
            ]
        });

        res.json({
            message: "Deudas obtenidas exitosamente",
            deudas
        });

    } catch (error) {
        console.error("Error en getDeudas:", error);
        res.status(500).json({
            message: "Error al obtener las deudas",
            error: error.message
        });
    }
}

// Obtener una deuda específica
const getDeudaById = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        const deuda = await Deuda.findByPk(id, {
            include: [{
                model: Abono,
                as: 'Abonos'
            }]
        });

        if (!deuda) {
            return res.status(404).json({
                message: "Deuda no encontrada"
            });
        }

        res.json({
            message: "Deuda obtenida exitosamente",
            deuda
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la deuda"
        });
    }
}

// Obtener todos los abonos (opcionalmente filtrados por deuda o usuario)
const getAbonos = async (req, res) => {
    try {
        const {
            id_deuda,
            id_usuario
        } = req.query;

        let whereClause = {};
        if (id_deuda) {
            whereClause.id_deuda = id_deuda;
        }

        // Filtramos por usuario si se proporciona, mediante el join con Deuda
        const abonos = await Abono.findAll({
            where: whereClause,
            order: [
                ['fecha_abono', 'DESC']
            ],
            include: [{
                model: Deuda,
                attributes: ['id_deuda', 'descripcion', 'acreedor', 'moneda', 'id_usuario'],
                where: id_usuario ? {
                    id_usuario
                } : {}
            }]
        });

        res.json({
            message: "Abonos obtenidos exitosamente",
            count: abonos.length,
            abonos
        });

    } catch (error) {
        console.error("Error en getAbonos:", error);
        res.status(500).json({
            message: "Error al obtener los abonos",
            error: error.message
        });
    }
}

// Obtener abonos de una deuda específica
const getAbonosByDeuda = async (req, res) => {
    try {
        const {
            id_deuda
        } = req.params;

        if (!id_deuda) {
            return res.status(400).json({
                message: "ID de deuda requerido"
            });
        }

        const abonos = await Abono.findAll({
            where: {
                id_deuda
            },
            order: [
                ['fecha_abono', 'DESC']
            ]
        });

        // Calcular totales
        const totalAbonado = abonos.reduce((sum, a) => sum + parseFloat(a.monto_abonado), 0);

        res.json({
            message: "Abonos obtenidos exitosamente",
            abonos,
            total_abonado: totalAbonado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los abonos"
        });
    }
}

// Obtener resumen del usuario (dashboard) mediante cálculos optimizados en DB
const getDashboardData = async (req, res) => {
    try {
        const {
            id_usuario
        } = req.params;

        if (!id_usuario) {
            return res.status(400).json({
                message: "ID de usuario requerido"
            });
        }

        // Obtener estadísticas agregadas directamente de la base de datos
        // Usamos una consulta cruda para eficiencia en indicadores globales
        const stats = await Deuda.findAll({
            where: {
                id_usuario
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id_deuda')), 'cantidad_deudas'],
                [
                    sequelize.literal(`SUM(CASE WHEN estado_pago = 'pagada' THEN 1 ELSE 0 END)`),
                    'deudas_pagadas'
                ],
                [
                    sequelize.literal(`SUM(CASE WHEN estado_pago != 'pagada' THEN 1 ELSE 0 END)`),
                    'deudas_pendientes'
                ],
                [
                    sequelize.literal(`SUM(monto_total + COALESCE(monto_interes, 0))`),
                    'total_deudas'
                ],
                [
                    sequelize.literal(`(
                        SELECT COALESCE(SUM(a.monto_abonado), 0)
                        FROM Abonos AS a
                        INNER JOIN Deudas AS d ON a.id_deuda = d.id_deuda
                        WHERE d.id_usuario = ${parseInt(id_usuario)}
                    )`),
                    'total_abonado'
                ]
            ],
            raw: true
        });

        const data = stats[0] || {};
        const total_deudas = parseFloat(data.total_deudas || 0);
        const total_abonado = parseFloat(data.total_abonado || 0);

        res.json({
            message: "Dashboard obtenido exitosamente",
            data: {
                total_deudas,
                total_abonado,
                saldo_pendiente: Math.max(0, total_deudas - total_abonado),
                cantidad_deudas: parseInt(data.cantidad_deudas || 0),
                deudas_pendientes: parseInt(data.deudas_pendientes || 0),
                deudas_pagadas: parseInt(data.deudas_pagadas || 0)
            }
        });

    } catch (error) {
        console.error("Error en getDashboardData:", error);
        res.status(500).json({
            message: "Error al obtener datos del dashboard",
            error: error.message
        });
    }
}

export {
    getDeudas,
    getDeudaById,
    getAbonos,
    getAbonosByDeuda,
    getDashboardData
};