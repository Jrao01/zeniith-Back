import {
    Usuario,
    Deuda,
    Abono,
    Notificacion,
    sequelize
} from './models/index.js';

async function testModels() {
    try {
        await sequelize.sync({
            force: true
        }); // Reset DB
        console.log("Database synced");

        // Create Usuario
        const user = await Usuario.create({
            nombre: "Juan Perez",
            email: "juan@example.com",
            password: "hashedpassword123",
            moneda_preferida: "USD"
        });
        console.log("Usuario created:", user.toJSON());

        // Create Deuda
        const deuda = await Deuda.create({
            id_usuario: user.id_usuario,
            monto_total: 100.50,
            moneda: "USD",
            fecha_registro: new Date(),
            estado_pago: "pendiente"
        });
        console.log("Deuda created:", deuda.toJSON());

        // Create Abono
        const abono = await Abono.create({
            id_deuda: deuda.id_deuda,
            monto_abonado: 50.00,
            moneda: "USD",
            restante_actual: 50.50
        });
        console.log("Abono created:", abono.toJSON());

        // Create Notificacion
        const notif = await Notificacion.create({
            id_usuario: user.id_usuario,
            id_deuda: deuda.id_deuda,
            mensaje: "Pago pendiente",
            fecha_programada: new Date()
        });
        console.log("Notificacion created:", notif.toJSON());

        // Verify Associations
        const userWithDeudas = await Usuario.findOne({
            where: {
                id_usuario: user.id_usuario
            },
            include: [{
                model: Deuda,
                include: [Abono, Notificacion]
            }]
        });

        console.log("User with Deudas and related data:", JSON.stringify(userWithDeudas, null, 2));

        if (userWithDeudas.Deudas.length === 1 &&
            userWithDeudas.Deudas[0].Abonos.length === 1 &&
            userWithDeudas.Deudas[0].Notificacions.length === 1) {
            console.log("SUCCESS: All models and associations are working correctly.");
        } else {
            console.error("FAILURE: Associations check failed.");
        }

    } catch (error) {
        console.error("Error testing models:", error);
    } finally {
        // await sequelize.close(); // Keep open if running app.js afterwards, but for script ok to close or just exit
    }
}

testModels();