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

// Função para calcular a relevância de um texto em relação à query (contagem simples de ocorrências)
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

// Função para criar um resumo (snippet) do conteúdo
function createSnippet(content, length = 200) {
  if (content.length <= length) return content;
  return content.substring(0, length).trim() + '...';
}

// Endpoint do chatbot – recebe uma query e retorna uma resposta formatada de forma orgânica
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
    // Se a atualização falhar, continua com os dados já existentes
  }

  // Lê a base de conhecimento
  const kb = readKnowledgeBase();
  if (!kb || !Array.isArray(kb) || kb.length === 0) {
    return res.status(500).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }

  // Analisa todos os itens para calcular a relevância com base na query
  const results = kb.map(entry => {
    const combinedText = entry.title + " " + entry.content;
    const score = calculateRelevance(query, combinedText);
    return { ...entry, score };
  }).filter(entry => entry.score > 0);

  // Se nenhum item for considerado relevante, retorna mensagem de erro
  if (results.length === 0) {
    return res.status(404).json({ error: "Desculpe, ocorreu um erro ao carregar a base de conhecimento." });
  }

  // Ordena os resultados por pontuação (score) de forma decrescente
  results.sort((a, b) => b.score - a.score);

  // Seleciona os três itens mais relevantes (ou menos, se não houver três)
  const topResults = results.slice(0, 3);

  // Constrói uma resposta orgânica combinando os trechos dos itens relevantes
  let responseText = "Olá, com base na sua dúvida, identifiquei as seguintes informações que podem ser úteis:\n\n";
  topResults.forEach(entry => {
    const snippet = createSnippet(entry.content, 200);
    // Cria um hyperlink no formato Markdown: [Título](URL)
    responseText += `• **${entry.title}**: ${snippet} [Leia mais](${entry.url})\n\n`;
  });
  responseText += "Espero que essas informações ajudem a esclarecer sua dúvida!";

  return res.json({ answer: responseText });
});

module.exports = router;
