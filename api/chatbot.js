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
    // Se o arquivo estiver vazio, retorna null
    if (!data.trim()) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler/parsing knowledgeBase.json:", error.message);
    return null;
  }
}

// Função para calcular a relevância de um texto em relação à query (análise de frequência)
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

// Função para criar um resumo do conteúdo (snippet)
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

  // Tenta atualizar a base de conhecimento; se falhar, usa os dados já existentes
  try {
    await updateKnowledgeBase();
  } catch (error) {
    console.error("Erro ao atualizar a base de conhecimento:", error.message);
    // Continua com os dados existentes, se houver
  }

  // Lê a base de conhecimento
  let kb = readKnowledgeBase();
  if (!kb || !Array.isArray(kb) || kb.length === 0) {
    return res.status(500).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }

  // Analisa cada registro considerando todos os campos (não apenas title e content)
  const results = kb.map(entry => {
    // Concatena title, content e (se houver) outros campos relevantes
    const combinedText = `${entry.title} ${entry.content}`;
    const score = calculateRelevance(query, combinedText);
    return { ...entry, score };
  }).filter(entry => entry.score > 0);

  // Se nenhum registro tiver relevância, retorna mensagem de erro
  if (results.length === 0) {
    return res.status(404).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }

  // Ordena os resultados por pontuação (score) em ordem decrescente
  results.sort((a, b) => b.score - a.score);

  // Seleciona os três registros mais relevantes (ou menos, se não houver três)
  const topResults = results.slice(0, 3);

  // Constrói a resposta de forma orgânica, formatada e com hyperlinks para as fontes
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
