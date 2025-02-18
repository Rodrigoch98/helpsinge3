const fs = require('fs');
const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const cron = require('node-cron');

const port = process.env.PORT || 3000;

function startServer() {
  const app = express();

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
    console.log(`Servidor rodando na porta ${port}`);
  });
}

// Verifica se a pasta node_modules existe
if (!fs.existsSync('./node_modules')) {
  console.log('node_modules não encontrado. Executando npm install...');
  exec('npm install', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro durante a instalação: ${error}`);
      process.exit(1);
    }
    console.log(`npm install finalizado:\n${stdout}`);
    startServer();
  });
} else {
  startServer();
}
