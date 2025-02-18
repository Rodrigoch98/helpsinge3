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

// Rota para o arquivo knowledgeBase.json
app.get('/knowledgeBase.json', (req, res) => {
  const kbPath = path.join(publicDir, 'knowledgeBase.json');
  if (fs.existsSync(kbPath)) {
    res.sendFile(kbPath);
  } else {
    res.json([]); // Retorna um array vazio se o arquivo não existir
  }
});

// Serve os arquivos estáticos da pasta "public"
app.use(express.static(publicDir));

// Importa as rotas (exemplo)
const scrapingRouter = require('./api/scraping');
const chatbotRouter = require('./api/chatbot');
app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

// Importa a função de atualização do scraper
const { updateKnowledgeBase } = require('./src/scrapHelpsinge');

// Caminho para o arquivo knowledgeBase.json
const kbPath = path.join(publicDir, 'knowledgeBase.json');

// Verifica se o arquivo é um JSON válido; se não, remove-o
try {
  const data = fs.readFileSync(kbPath, 'utf8');
  JSON.parse(data);
} catch (error) {
  console.warn("Arquivo knowledgeBase.json inválido ou inexistente. Removendo e regenerando...");
  if (fs.existsSync(kbPath)) fs.unlinkSync(kbPath);
}

// Agenda a tarefa para atualizar a base diariamente às 03:00 UTC
cron.schedule('0 3 * * *', () => {
  console.log("Executando tarefa agendada: Atualizando base de conhecimento.");
  updateKnowledgeBase();
}, {
  scheduled: true,
  timezone: "UTC"
});

// Atualiza a base no startup
console.log("Atualizando a base de conhecimento no startup...");
updateKnowledgeBase();

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
