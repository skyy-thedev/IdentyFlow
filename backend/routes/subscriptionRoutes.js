const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const auth = require("../middlewares/authMiddleware");

// Rotas públicas
router.get("/planos", subscriptionController.getPlanos);

// Webhook de pagamento (sem auth, mas com validação de assinatura)
router.post("/webhook", subscriptionController.webhookPagamento);

// Rotas autenticadas
router.get("/minha", auth([]), subscriptionController.getMinhaAssinatura);
router.get("/feature/:feature", auth([]), subscriptionController.verificarFeature);
router.get("/limite/:tipo", auth([]), subscriptionController.verificarLimite);
router.post("/criar", auth([]), subscriptionController.criarAssinatura);
router.post("/trial", auth([]), subscriptionController.iniciarTrial);
router.post("/cancelar", auth([]), subscriptionController.cancelarAssinatura);

module.exports = router;
