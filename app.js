// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Garante que a pasta "public" exista
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Função para verificar se uma string é JSON válido
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

// Rota para servir o arquivo knowledgeBase.json
app.get('/knowledgeBase.json', async (req, res) => {
  const kbPath = path.join(publicDir, 'knowledgeBase.json');
  try {
    // Se o arquivo não existir, gera-o
    if (!fs.existsSync(kbPath)) {
      console.log("Arquivo knowledgeBase.json não encontrado. Gerando um novo...");
      await updateKnowledgeBase();
    } else {
      // Lê o arquivo e verifica se o conteúdo é JSON válido
      const data = fs.readFileSync(kbPath, 'utf8');
      if (!isValidJson(data)) {
        console.warn("Conteúdo inválido detectado em knowledgeBase.json. Regenerando...");
        await updateKnowledgeBase();
      }
    }
    // Envia o arquivo JSON
    res.sendFile(kbPath);
  } catch (error) {
    console.error("Erro ao servir o arquivo knowledgeBase.json:", error.message);
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
});

// Serve os arquivos estáticos da pasta "public"
app.use(express.static(publicDir));

// Define os routers para os endpoints adicionais
app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

// No startup, se o arquivo existir mas o conteúdo não for um JSON válido, remove-o para forçar a regeneração
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

// Atualiza a base de conhecimento no startup
console.log("Atualizando a base de conhecimento no startup...");
updateKnowledgeBase();

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
