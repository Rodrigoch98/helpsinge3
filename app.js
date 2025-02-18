const fs = require('fs');
const path = require('path');
const express = require('express');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos a partir da pasta "src"
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src')));

// Routers
const scrapingRouter = require('./api/scraping');
const chatbotRouter = require('./api/chatbot');

app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

// Importa a função de atualização do scraper
const { updateKnowledgeBase } = require('./src/scrapHelpsinge');

// Caminho completo para o arquivo knowledgeBase.json na pasta "src"
const kbPath = path.join(__dirname, 'src', 'knowledgeBase.json');

// Se o arquivo não existir, gera-o imediatamente
if (!fs.existsSync(kbPath)) {
  console.log("Arquivo knowledgeBase.json não encontrado. Gerando-o agora...");
  updateKnowledgeBase();
}

// Agendamento para atualizar a base de conhecimento diariamente às 03:00 UTC
cron.schedule(
  '0 3 * * *',
  () => {
    console.log("Executando tarefa agendada: Atualizando base de conhecimento.");
    updateKnowledgeBase();
  },
  {
    scheduled: true,
    timezone: "UTC"
  }
);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
