require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const cursosRoutes = require("./routes/Cursos");
const alunoRoutes = require("./routes/alunoRoutes");
const statsRoutes = require("./routes/statsRoutes");
const turmaRoutes = require("./routes/turmaRoutes");

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  'http://localhost:3000',
  'https://identyflow.vercel.app',
  'https://identyflow-frontend.vercel.app',
  'https://www.identyflow.com.br',
  'https://identyflow.com.br'
];

// CORS configurado para aceitar requisições do frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requests sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origem bloqueada pelo CORS:', origin);
      callback(null, true); // Temporariamente permite todas para debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota de health check
app.get("/", (req, res) => {
  res.json({ status: "API IdentyFlow online!", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/cursos", cursosRoutes);
app.use("/alunos", alunoRoutes);
app.use("/stats", statsRoutes);
app.use("/turmas", turmaRoutes);

connectDB();

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
);
