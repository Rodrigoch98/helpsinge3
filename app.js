// app.js
const express = require('express');
const app = express();

// Se necessário, configure middlewares (ex: express.json())
app.use(express.json());

// Importa o router de scraping
const scrapingRouter = require('./api/scraping');

// Monta o router na rota '/api/scraping'
// Assim, requisições para, por exemplo, http://localhost:3000/api/scraping?url=... serão tratadas pelo router.
app.use('/api/scraping', scrapingRouter);

// Configuração da porta (pode ser definida via variável de ambiente ou padrão 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
