import {
    login,
    register,
    createDeuda,
    updateDeuda,
    deleteDeuda,
    createAbono
} from "../controllers/postControllers.js";

import {
    getDeudas,
    getDeudaById,
    getAbonos,
    getAbonosByDeuda,
    getDashboardData
} from "../controllers/getControllers.js";

import express from "express";

const router = express.Router();

// Auth routes
router.post("/login", login);
router.post("/register", register);

// Deudas routes
router.get("/deudas/usuario/:id_usuario", getDeudas);
router.get("/deudas/:id", getDeudaById);
router.post("/deudas", createDeuda);
router.put("/deudas/:id", updateDeuda);
router.delete("/deudas/:id", deleteDeuda);

// Abonos routes
router.get("/abonos", getAbonos);
router.get("/abonos/deuda/:id_deuda", getAbonosByDeuda);
router.post("/abonos", createAbono);

// Dashboard route
router.get("/dashboard/:id_usuario", getDashboardData);

export default router;