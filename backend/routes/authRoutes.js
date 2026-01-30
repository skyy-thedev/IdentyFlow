const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");


router.post("/login", authController.login);

// GET /auth/users - Listar usuários
// GOD vê todos, Admin vê apenas seus instrutores
router.get("/users", authMiddleware(["god", "admin"]), async (req, res) => {
  try {
    let query = {};
    
    // Admin só vê seus próprios instrutores
    if (req.user.role === "admin") {
      query = { 
        $or: [
          { _id: req.user.id }, // O próprio admin
          { adminPai: req.user.id } // Seus instrutores
        ]
      };
    }
    
    const users = await User.find(query, "-senha")
      .populate("adminPai", "nome email nomeEmpresa");

    res.json({
      total: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({ msg: "Erro ao buscar usuários", error });
  }
});

// POST /auth/register - Registro público (cria admin)
router.post("/register", async (req, res) => {
  console.log("REQ BODY:", req.body);

  const { nome, email, senha, nomeEmpresa } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({ msg: "Campos obrigatórios faltando" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Usuário já existe" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    // Registro público sempre cria admin (cliente do sistema)
    const newUser = new User({
      nome,
      email,
      senha: hashedSenha,
      role: "admin",
      nomeEmpresa: nomeEmpresa || ""
    });

    const savedUser = await newUser.save();
    console.log("Admin criado com sucesso:", savedUser);

    res.status(201).json({ msg: "Conta criada com sucesso", user: savedUser });
  } catch (err) {
    console.error("ERRO AO CRIAR USUÁRIO:", err);
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
  }
});

// POST /auth/instrutor - Admin cria instrutor vinculado a ele
router.post("/instrutor", authMiddleware(["admin", "god"]), async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;
    const adminId = req.user.id;
    const adminRole = req.user.role;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ msg: "Campos obrigatórios faltando" });
    }
    
    // Verificar limite de instrutores do plano
    if (adminRole !== "god") {
      const subscription = await Subscription.findOne({ 
        userId: adminId, 
        status: "ativa" 
      });
      
      if (subscription) {
        const planoConfig = subscription.getPlanoConfig();
        const limiteInstrutores = planoConfig?.limites?.instrutores || 3;
        
        const instrutoresAtuais = await User.countDocuments({ adminPai: adminId });
        
        if (instrutoresAtuais >= limiteInstrutores) {
          return res.status(403).json({ 
            msg: `Limite de ${limiteInstrutores} instrutores atingido para o plano ${planoConfig?.nome}`,
            limite: limiteInstrutores,
            atual: instrutoresAtuais
          });
        }
      }
    }
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email já está em uso" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);
    
    const newInstrutor = new User({
      nome,
      email,
      senha: hashedSenha,
      telefone,
      role: "instrutor",
      adminPai: adminRole === "god" ? null : adminId // GOD não tem adminPai
    });
    
    const savedInstrutor = await newInstrutor.save();
    
    res.status(201).json({ 
      msg: "Instrutor criado com sucesso", 
      user: {
        id: savedInstrutor._id,
        nome: savedInstrutor.nome,
        email: savedInstrutor.email,
        role: savedInstrutor.role
      }
    });
  } catch (err) {
    console.error("Erro ao criar instrutor:", err);
    res.status(500).json({ msg: "Erro ao criar instrutor", error: err.message });
  }
});

// PUT /auth/users/:id - Atualizar perfil do usuário
router.put("/users/:id", authMiddleware([]), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, foto, role } = req.body;
    
    // Verificar se é o próprio usuário ou admin/god
    if (req.user.id !== id && !["god", "admin"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Sem permissão para editar este usuário" });
    }
    
    // Verificar se email já existe para outro usuário
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ msg: "Email já está em uso" });
      }
    }
    
    const updateData = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (foto !== undefined) updateData.foto = foto;
    
    // Apenas GOD pode mudar a role (e não para god)
    if (role && req.user.role === "god" && role !== "god") {
      updateData.role = role;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select("-senha");
    
    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ msg: "Erro ao atualizar usuário", error: err.message });
  }
});

// DELETE /auth/users/:id - Deletar usuário (somente god)
router.delete("/users/:id", authMiddleware(["god"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }
    
    res.json({ msg: "Usuário deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar usuário:", err);
    res.status(500).json({ msg: "Erro ao deletar usuário", error: err.message });
  }
});

module.exports = router;
