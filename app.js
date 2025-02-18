const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const cron = require('node-cron');

// Middlewares
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

// Agende a tarefa para atualizar a base de conhecimento diariamente às 03:00 UTC
cron.schedule('0 3 * * *', () => {
  console.log("Executando tarefa agendada: Atualizando base de conhecimento.");
  updateKnowledgeBase();
}, {
  scheduled: true,
  timezone: "UTC"
});

// Se o arquivo knowledgeBase.json não existir, gera-o
const fs = require('fs');
const kbPath = path.join(__dirname, 'src', 'knowledgeBase.json');
if (!fs.existsSync(kbPath)) {
  console.log("Arquivo knowledgeBase.json não encontrado. Gerando-o agora...");
  updateKnowledgeBase();
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
