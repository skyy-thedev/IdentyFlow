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

// Função para gerar senha aleatória segura
function gerarSenha(tamanho = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// POST /auth/instrutor - Admin ou GOD cria instrutor OU GOD cria admin OU GOD vincula instrutor existente
router.post("/instrutor", authMiddleware(["admin", "god"]), async (req, res) => {
  try {
    const { nome, email, telefone, role, adminPai, instrutorExistenteId } = req.body;
    let { senha } = req.body;
    const criadorId = req.user.id;
    const criadorRole = req.user.role;

    // GOD pode criar admin ou instrutor, admin só pode criar instrutor
    const novoRole = criadorRole === "god" ? (role || "instrutor") : "instrutor";

    // Vincular instrutor já existente
    if (instrutorExistenteId && criadorRole === "god") {
      const instrutor = await User.findById(instrutorExistenteId);
      if (!instrutor || instrutor.role !== "instrutor") {
        return res.status(404).json({ msg: "Instrutor não encontrado" });
      }
      instrutor.adminPai = adminPai || null;
      await instrutor.save();
      return res.status(200).json({ msg: "Instrutor vinculado com sucesso", user: instrutor });
    }

    if (!nome || !email) {
      return res.status(400).json({ msg: "Campos obrigatórios faltando" });
    }

    // Verificar limite de instrutores do plano (apenas para admin criando instrutor)
    if (criadorRole === "admin" && novoRole === "instrutor") {
      const subscription = await Subscription.findOne({ userId: criadorId, status: "ativa" });
      if (subscription) {
        const planoConfig = subscription.getPlanoConfig();
        const limiteInstrutores = planoConfig?.limites?.instrutores || 3;
        const instrutoresAtuais = await User.countDocuments({ adminPai: criadorId });
        if (instrutoresAtuais >= limiteInstrutores) {
          return res.status(403).json({ msg: `Limite de ${limiteInstrutores} instrutores atingido para o plano ${planoConfig?.nome}` });
        }
      }
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email já está em uso" });
    }

    // Gerar senha se não enviada
    if (!senha) senha = gerarSenha(8);
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    // GOD pode criar admin ou instrutor, admin só instrutor
    const novoUser = new User({
      nome,
      email,
      senha: hashedSenha,
      telefone,
      role: novoRole,
      adminPai: novoRole === "instrutor" ? (criadorRole === "god" ? (adminPai || null) : criadorId) : null
    });

    const savedUser = await novoUser.save();

    res.status(201).json({
      msg: `${novoRole === "admin" ? "Admin" : "Instrutor"} criado com sucesso`,
      user: {
        id: savedUser._id,
        nome: savedUser.nome,
        email: savedUser.email,
        role: savedUser.role,
        adminPai: savedUser.adminPai
      },
      senhaGerada: senha
    });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    res.status(500).json({ msg: "Erro ao criar usuário", error: err.message });
  }
});

// GET /auth/instrutores-sem-admin - GOD lista instrutores sem adminPai
router.get("/instrutores-sem-admin", authMiddleware(["god"]), async (req, res) => {
  try {
    const instrutores = await User.find({ role: "instrutor", $or: [ { adminPai: null }, { adminPai: { $exists: false } } ] });
    res.json({ instrutores });
  } catch (err) {
    res.status(500).json({ msg: "Erro ao buscar instrutores", error: err.message });
  }
});

// PUT /auth/users/:id - Atualizar perfil do usuário
router.put("/users/:id", authMiddleware([]), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, foto, role, adminPai } = req.body;
    
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

    // GOD pode alterar adminPai de qualquer usuário
    if (req.user.role === "god" && adminPai !== undefined) {
      updateData.adminPai = (!adminPai || adminPai === "") ? null : adminPai;
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
    res.status(500).json({ msg: "Erro ao atualizar usuário", error: err.message, stack: err.stack });
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
