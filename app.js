const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares para tratamento de JSON e dados enviados via formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define a pasta "public"
const publicDir = path.join(__dirname, 'public');

// Cria a pasta "public" se ela não existir
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Caminho para o arquivo knowledgeBase.json
const kbPath = path.join(publicDir, 'knowledgeBase.json');

// Verifica se o arquivo existe; se não existir ou estiver vazio, cria-o com um array vazio (JSON válido)
try {
  if (!fs.existsSync(kbPath)) {
    console.warn("Arquivo knowledgeBase.json não encontrado. Criando o arquivo com conteúdo vazio.");
    fs.writeFileSync(kbPath, '[]', 'utf8');
  } else {
    const data = fs.readFileSync(kbPath, 'utf8');
    if (!data || data.trim() === '') {
      console.warn("Arquivo knowledgeBase.json está vazio. Preenchendo com um array vazio.");
      fs.writeFileSync(kbPath, '[]', 'utf8');
    }
  }
} catch (err) {
  console.error("Erro ao verificar/criar o arquivo knowledgeBase.json:", err.message);
}

// Rota para servir o arquivo knowledgeBase.json
app.get('/knowledgeBase.json', (req, res) => {
  try {
    const data = fs.readFileSync(kbPath, 'utf8');
    // Caso o conteúdo seja vazio, retorna um array vazio
    if (!data || data.trim() === '') {
      return res.json([]);
    }
    // Valida se o JSON é válido
    JSON.parse(data);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error("Erro ao carregar o arquivo knowledgeBase.json:", err.message);
    res.status(200).json([]);
  }
});

// Serve arquivos estáticos da pasta "public"
app.use(express.static(publicDir));

// Rotas adicionais (mantenha as rotas dos outros módulos conforme necessário)
const scrapingRouter = require('./api/scraping');
const chatbotRouter = require('./api/chatbot');
app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
