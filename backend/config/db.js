const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("📦 Usando conexão existente do MongoDB");
    return;
  }

  try {
    console.log("🔄 Conectando ao MongoDB...");
    
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = db.connections[0].readyState === 1;
    const dbName = mongoose.connection.db.databaseName;
    console.log(`🔥 MongoDB conectado! Database: ${dbName}`);
  } catch (error) {
    console.error("❌ Erro ao conectar no MongoDB:", error.message);
    // Não usar process.exit em ambiente serverless
  }
}

module.exports = connectDB;