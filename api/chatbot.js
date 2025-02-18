const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Importa a função de atualização do scraper
const { updateKnowledgeBase } = require('../src/scrapHelpsinge');

// Função para ler o arquivo knowledgeBase.json e verificar se contém dados válidos
function readKnowledgeBase() {
  const kbPath = path.join(__dirname, '..', 'public', 'knowledgeBase.json');
  try {
    if (!fs.existsSync(kbPath)) {
      return null;
    }
    const data = fs.readFileSync(kbPath, 'utf8');
    if (!data.trim()) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler/parsing do knowledgeBase.json:", error.message);
    return null;
  }
}

// Função para calcular a relevância da query em relação a um texto
function calculateRelevance(query, text) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();
  let score = 0;
  for (const word of queryWords) {
    if (!word) continue;
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = textLower.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  return score;
}

// Função para criar um snippet (resumo) do conteúdo
function createSnippet(content, length = 200) {
  if (content.length <= length) return content;
  return content.substring(0, length).trim() + '...';
}

// Endpoint do chatbot: recebe a query e retorna a resposta
router.post('/', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query não fornecida." });
  }

  // Tenta atualizar a base de conhecimento antes de realizar a busca
  try {
    await updateKnowledgeBase();
  } catch (error) {
    console.error("Erro ao atualizar a base de conhecimento:", error.message);
    // Continua com os dados existentes, se houver
  }

  // Lê a base de conhecimento
  const kb = readKnowledgeBase();
  if (!kb || !Array.isArray(kb) || kb.length === 0) {
    return res.status(500).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }

  // Analisa cada registro, considerando uma combinação de todos os campos relevantes
  const results = kb.map(entry => {
    const combinedText = `${entry.title} ${entry.content}`;
    const score = calculateRelevance(query, combinedText);
    return { ...entry, score };
  }).filter(entry => entry.score > 0);

  if (results.length === 0) {
    return res.status(404).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }

  // Ordena os resultados pela pontuação em ordem decrescente e seleciona os melhores
  results.sort((a, b) => b.score - a.score);
  const topResults = results.slice(0, 3);

  // Monta a resposta de forma orgânica e bem formatada
  let responseText = "Olá! Baseado na sua dúvida, identifiquei as seguintes informações que podem ajudar:\n\n";
  topResults.forEach(entry => {
    const snippet = createSnippet(entry.content, 200);
    // Formata o link como hyperlink em Markdown: [Título](URL)
    responseText += `• **${entry.title}**: ${snippet} [Leia mais](${entry.url})\n\n`;
  });
  responseText += "Espero que essas informações tenham esclarecido sua dúvida!";

  return res.json({ answer: responseText });
});

module.exports = router;
