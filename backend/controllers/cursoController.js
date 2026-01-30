// Controller for Curso (Course) operations, including soft delete
const Curso = require('../models/Cursos');

// Soft delete a course: marks as inactive and sets deletion date
exports.softDeleteCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ msg: 'Curso não encontrado.' });
    }
    if (!curso.ativo) {
      return res.status(400).json({ msg: 'Curso já está inativo.' });
    }
    curso.ativo = false;
    curso.deletadoEm = new Date();
    await curso.save();
    res.json({ msg: 'Curso desativado (soft delete) com sucesso!', curso });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao desativar curso', error: err.message });
  }
};

// Get only active courses (includes courses without 'ativo' field - legacy data)
exports.getCursosAtivos = async (req, res) => {
  try {
    // Busca cursos ativos OU que não têm o campo 'ativo' definido (dados antigos)
    const cursos = await Curso.find({ 
      $or: [
        { ativo: true },
        { ativo: { $exists: false } }
      ]
    }).sort({ criadoEm: -1 });
    res.json({ cursos });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao carregar cursos' });
  }
};

// (Sugestão extra) Reativar um curso
exports.reativarCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ msg: 'Curso não encontrado.' });
    }
    if (curso.ativo) {
      return res.status(400).json({ msg: 'Curso já está ativo.' });
    }
    curso.ativo = true;
    curso.deletadoEm = null;
    await curso.save();
    res.json({ msg: 'Curso reativado com sucesso!', curso });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao reativar curso', error: err.message });
  }
};
