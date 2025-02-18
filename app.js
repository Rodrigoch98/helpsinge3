const express = require('express');
const path = require('path');
const fs = require('fs');

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

// Rota personalizada para o arquivo knowledgeBase.json
app.get('/knowledgeBase.json', (req, res) => {
  const kbPath = path.join(publicDir, 'knowledgeBase.json');
  try {
    // Verifica se o arquivo existe e se não está vazio
    const stat = fs.statSync(kbPath);
    if (stat.size > 0) {
      res.sendFile(kbPath);
    } else {
      // Se o arquivo estiver vazio, retorna um array vazio
      res.json([]);
    }
  } catch (err) {
    // Se o arquivo não existir, retorna um array vazio
    res.json([]);
  }
});

// Serve os arquivos estáticos da pasta "public"
app.use(express.static(publicDir));

// Routers (mantendo os roteadores existentes)
const scrapingRouter = require('./api/scraping');
const chatbotRouter = require('./api/chatbot');
app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
