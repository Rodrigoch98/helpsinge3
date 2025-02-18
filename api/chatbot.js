const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Importa a função de atualização da base de conhecimento
const { updateKnowledgeBase } = require('../src/scrapHelpsinge');

// Função para ler o arquivo knowledgeBase.json
function readKnowledgeBase() {
  const kbPath = path.join(__dirname, '..', 'public', 'knowledgeBase.json');
  try {
    const data = fs.readFileSync(kbPath, 'utf8');
    const kb = JSON.parse(data);
    return kb;
  } catch (error) {
    console.error("Erro ao ler knowledgeBase.json:", error.message);
    return null;
  }
}

// Endpoint do chatbot – recebe uma query e retorna uma resposta da base de conhecimento
router.post('/', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query não fornecida." });
  }

  // Tenta atualizar a base de conhecimento
  try {
    await updateKnowledgeBase();
  } catch (error) {
    console.error("Erro ao atualizar a base de conhecimento:", error.message);
    // Se a atualização falhar, continua com os dados já presentes
  }

  // Lê a base de conhecimento
  const kb = readKnowledgeBase();
  if (!kb || !Array.isArray(kb) || kb.length === 0) {
    return res.status(500).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }

  // Procura por um registro cujo título ou conteúdo contenha a query (busca simples, sem processamento de NLP)
  const answerEntry = kb.find(entry =>
    entry.content.toLowerCase().includes(query.toLowerCase()) ||
    entry.title.toLowerCase().includes(query.toLowerCase())
  );

  if (answerEntry) {
    return res.json({
      answer: answerEntry.content,
      source: answerEntry.url
    });
  } else {
    return res.status(404).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }
});

module.exports = router;
