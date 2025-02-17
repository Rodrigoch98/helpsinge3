const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cron = require('node-cron');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Também, se desejar, você pode chamar a atualização logo na inicialização:
updateKnowledgeBase();

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
