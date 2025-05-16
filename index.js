const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
mongoose
    .connect(mongoUri)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch((err) => console.error("❌ Error de conexión", err));

const libroSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
});
const Libro = mongoose.model("Libro", libroSchema);

// Middleware de autenticación
app.use((req, res, next) => {
    const authToken = req.headers["authorization"];
    if (authToken === "miTokenSecreto123") {
        next();
    } else {
        res.status(401).send("Acceso no autorizado");
    }
});

// Crear libro
app.post("/libros", async (req, res) => {
    const libro = new Libro(req.body);
    try {
        await libro.save();
        res.status(201).json(libro);
    } catch (error) {
        res.status(500).send("Error al guardar el libro");
    }
});

// Listar todos
app.get("/libros", async (req, res) => {
    try {
        const libros = await Libro.find();
        res.json(libros);
    } catch (error) {
        res.status(500).send("Error al obtener los libros");
    }
});

// Obtener por ID
app.get("/libros/:id", async (req, res) => {
    try {
        const libro = await Libro.findById(req.params.id);
        if (libro) res.json(libro);
        else res.status(404).send("Libro no encontrado");
    } catch (error) {
        res.status(500).send("Error al buscar el libro");
    }
});

// Actualizar libro
app.put("/libros/:id", async (req, res) => {
    try {
        const actualizado = await Libro.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (actualizado) res.json(actualizado);
        else res.status(404).send("Libro no encontrado para actualizar");
    } catch (error) {
        res.status(500).send("Error al actualizar el libro");
    }
});

// Eliminar libro
app.delete("/libros/:id", async (req, res) => {
    try {
        const eliminado = await Libro.findByIdAndDelete(req.params.id);
        if (eliminado) res.json({ mensaje: "Libro eliminado", eliminado });
        else res.status(404).send("Id de libro no encontrado");
    } catch (error) {
        res.status(500).send("Error al eliminar el libro");
    }
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}/`);
});
