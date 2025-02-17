const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// GET /api/scraping?url=...
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'A URL é obrigatória.' });
  }
  
  try {
    // Faz a requisição HTTP para obter o HTML da página
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove elementos desnecessários
    $('script, style, nav, footer, header').remove();

    // Seleciona o conteúdo principal (ajuste os seletores conforme a estrutura do site)
    const mainContent = $('main, article, .content').first();
    const text = mainContent.length ? mainContent.text() : $.text();

    // Extrai o título da página
    const pageTitle = $('title').text();

    // Retorna o JSON com os dados extraídos
    res.status(200).json({
      url,
      title: pageTitle.trim(),
      content: text.trim()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Falha ao acessar a URL',
      details: error.toString()
    });
  }
});

module.exports = router;
