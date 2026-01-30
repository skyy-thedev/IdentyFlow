const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });

      const valid = await bcrypt.compare(senha, user.senha);
      if (!valid) return res.status(401).json({ msg: "Senha incorreta." });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        msg: "Login realizado com sucesso!",
        token,
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone || "",
          foto: user.foto || "",
          role: user.role
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
};
