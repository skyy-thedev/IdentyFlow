require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const cursosRoutes = require("./routes/Cursos");
const alunoRoutes = require("./routes/alunoRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/cursos", cursosRoutes);
app.use("/alunos", alunoRoutes); // 👈 ESSENCIAL

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
);
