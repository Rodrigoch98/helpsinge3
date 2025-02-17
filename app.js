const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares para lidar com JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importa os routers
const scrapingRouter = require('./api/scraping');
const chatbotRouter = require('./api/chatbot');

// Define as rotas
app.use('/api/scraping', scrapingRouter);
app.use('/api/chatbot', chatbotRouter);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
