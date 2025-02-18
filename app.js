// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares para receber JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define a pasta "public" (garante que está no local certo)
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Função para validar se uma string é JSON
function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Importa os routers e a função de atualização do scraper
const scrapingRouter = require('./api/scraping');
const chatbotRouter = require('./api/chatbot');
const { updateKnowledgeBase } = require('./src/scrapHelpsinge');

// Rota personalizada para o arquivo knowledgeBase.json
app.get('/knowledgeBase.json', async (req, res) => {
  const kbPath = path.join(publicDir, 'knowledgeBase.json');
  try {
    // Se o arquivo não existir, tenta gerá-lo
    if (!fs.existsSync(kbPath)) {
      console.log("knowledgeBase.json não encontrado. Gerando...");
      await updateKnowledgeBase();
    } else {
      // Se existir, verifica se o conteúdo é um JSON válido
      const data = fs.readFileSync(kbPath, 'utf8');
      if (!isValidJson(data)) {
        console.warn("Conteúdo inválido em knowledgeBase.json. Regenerando...");
        fs.unlinkSync(kbPath);
        await updateKnowledgeBase();
      }
    }
    // Envia o arquivo JSON
    res.sendFile(kbPath);
  } catch (error) {
    console.error("Erro ao servir knowledgeBase.json:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Serve os arquivos estáticos da pasta "public"
app.use(express.static(publicDir));

// Configura os routers para endpoints adicionais
app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

// No startup, se o arquivo existir mas não for um JSON válido, remove-o
const kbPathStartup = path.join(publicDir, 'knowledgeBase.json');
try {
  if (fs.existsSync(kbPathStartup)) {
    const data = fs.readFileSync(kbPathStartup, 'utf8');
    JSON.parse(data);
  }
} catch (error) {
  console.warn("No startup, o arquivo knowledgeBase.json é inválido. Removendo para regenerar...");
  if (fs.existsSync(kbPathStartup)) fs.unlinkSync(kbPathStartup);
}

try {
  const jsonData = JSON.stringify(scrapedData, null, 2);
  JSON.parse(jsonData); // Valida o JSON
  fs.writeFileSync(outputPath, jsonData, 'utf8');
  console.log("Base de conhecimento atualizada com sucesso!");
} catch (err) {
  console.error("Erro ao salvar ou validar o arquivo knowledgeBase.json:", err.message);
}

// Agenda a tarefa para atualizar a base de conhecimento diariamente às 03:00 UTC
cron.schedule(
  '0 3 * * *',
  () => {
    console.log("Tarefa agendada: Atualizando a base de conhecimento.");
    updateKnowledgeBase();
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

// Inicia o servidor somente após atualizar a base de conhecimento
(async () => {
  console.log("Atualizando a base de conhecimento no startup...");
  try {
    await updateKnowledgeBase();
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (err) {
    console.error("Erro ao atualizar a base de conhecimento no startup:", err.message);
    process.exit(1);
  }
})();
