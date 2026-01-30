const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");


router.post("/login", authController.login);
router.get("/users", authMiddleware(["god", "admin"]), async (req, res) => {
  try {
    const users = await User.find({}, "-senha"); 
    // o "-senha" remove a senha dos resultados por segurança

    res.json({
      total: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({ msg: "Erro ao buscar usuários", error });
  }
});
// POST /auth/register
router.post("/register", async (req, res) => {
  console.log("REQ BODY:", req.body); // Mostra o corpo recebido

  const { nome, email, senha, profissao } = req.body;

  try {
    // Validação básica
    if (!nome || !email || !senha) {
      console.log("Campos obrigatórios faltando");
      return res.status(400).json({ msg: "Campos obrigatórios faltando" });
    }

    // Verifica se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Usuário já existe:", email);
      return res.status(400).json({ msg: "Usuário já existe" });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    // Criação do usuário
    const newUser = new User({
      nome,
      email,
      senha: hashedSenha,
      profissao,
    });

    const savedUser = await newUser.save();
    console.log("Usuário criado com sucesso:", savedUser);

    res.status(201).json({ msg: "Usuário criado com sucesso", user: savedUser });
  } catch (err) {
    console.error("ERRO AO CRIAR USUÁRIO:", err); // <-- Mostra o erro completo
    res.status(500).json({ msg: "Erro no servidor", error: err.message });
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
