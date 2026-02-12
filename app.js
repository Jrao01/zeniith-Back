import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import {
    sequelize
} from "./models/index.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/", postRoutes);

app.get("/ping", (req, res) => {
    res.json({
        message: "pong"
    });
});

sequelize.sync({
        alter: true
    })
    .then(() => {
        console.log("Database synced");
    })
    .catch((err) => {
        console.log(err);
    });

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});