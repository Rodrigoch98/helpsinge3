const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Carrega a base de conhecimento do arquivo JSON (assegure-se de que o arquivo exista na pasta src)
const knowledgeBasePath = path.join(process.cwd(), 'src', 'knowledgeBase.json');
let knowledgeBase = [];
try {
  const data = fs.readFileSync(knowledgeBasePath, 'utf8');
  knowledgeBase = JSON.parse(data);
  console.log('Base de conhecimento carregada com sucesso.');
} catch (err) {
  console.error('Erro ao carregar a base de conhecimento:', err);
}

// Função de similaridade usando o índice de Jaccard
function jaccardSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\W+/));
  const words2 = new Set(text2.toLowerCase().split(/\W+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// GET /api/chatbot?question=...
router.get('/', (req, res) => {
  const question = req.query.question;
  if (!question) {
    return res.status(400).json({ error: 'A pergunta (question) é obrigatória na query string.' });
  }
  
  // Encontra a entrada da base de conhecimento com maior similaridade
  let bestMatch = null;
  let bestScore = 0;
  
  for (const entry of knowledgeBase) {
    // Calcula a similaridade com base no título e no conteúdo
    const titleSim = jaccardSimilarity(question, entry.title || '');
    const contentSim = jaccardSimilarity(question, entry.content || '');
    const simScore = Math.max(titleSim, contentSim);
    if (simScore > bestScore) {
      bestScore = simScore;
      bestMatch = entry;
    }
  }
  
  // Se a similaridade for baixa, pode retornar uma mensagem padrão
  if (!bestMatch || bestScore < 0.1) {
    return res.json({ answer: "Desculpe, não encontrei uma resposta para a sua pergunta." });
  }
  
  // Retorna a resposta encontrada (pode customizar o que é retornado)
  res.json({
    answer: bestMatch.content,
    title: bestMatch.title,
    similarity: bestScore
  });
});

module.exports = router;
