require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const cursosRoutes = require("./routes/Cursos");
const alunoRoutes = require("./routes/alunoRoutes");

const app = express();

// CORS configurado para aceitar requisições do frontend
app.use(cors({
  origin: ['http://localhost:3000', 'https://identyflow.vercel.app', 'https://identyflow-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rota de health check
app.get("/", (req, res) => {
  res.json({ status: "API IdentyFlow online!", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/cursos", cursosRoutes);
app.use("/alunos", alunoRoutes);

connectDB();

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
);
