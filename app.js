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

// Serve os arquivos estáticos da pasta "public"
app.use(express.static(publicDir));

// Routers
const scrapingRouter = require('./api/scraping');
const chatbotRouter = require('./api/chatbot');
app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

// Importa a função de atualização do scraper
const { updateKnowledgeBase } = require('./src/scrapHelpsinge');

// Caminho absoluto para o arquivo knowledgeBase.json
const kbPath = path.join(publicDir, 'knowledgeBase.json');

// Se o arquivo existir mas não for JSON válido, apaga-o
try {
  const data = fs.readFileSync(kbPath, 'utf8');
  JSON.parse(data);
} catch (error) {
  console.warn("Arquivo knowledgeBase.json inválido ou inexistente. Removendo e regenerando...");
  if (fs.existsSync(kbPath)) {
    fs.unlinkSync(kbPath);
  }
}

// Agenda a tarefa para atualizar a base de conhecimento diariamente às 03:00 UTC
cron.schedule('0 3 * * *', () => {
  console.log("Executando tarefa agendada: Atualizando base de conhecimento.");
  updateKnowledgeBase();
}, {
  scheduled: true,
  timezone: "UTC"
});

// Atualiza a base de conhecimento no startup (sempre forçando a atualização)
console.log("Atualizando a base de conhecimento no startup...");
updateKnowledgeBase();

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
