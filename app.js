const express = require('express');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares para parsing e para servir arquivos estáticos da pasta "src"
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

// Caminho para o arquivo knowledgeBase.json (na pasta src)
const kbPath = path.join(__dirname, 'src', 'knowledgeBase.json');

// Função para iniciar o servidor somente após garantir que o arquivo knowledgeBase.json existe
async function initServer() {
  // Se o arquivo não existir, gera-o automaticamente
  if (!fs.existsSync(kbPath)) {
    console.log("Arquivo knowledgeBase.json não encontrado. Gerando-o agora...");
    await updateKnowledgeBase();
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

  // Inicia o servidor
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

initServer();
