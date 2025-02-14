/**
 * api/scraping.js
 * ---------------
 * Exemplo de código para realizar scraping via HTTP GET em um endpoint local.
 * 
 * COMPORTAMENTO:
 *  - Recebe um parâmetro ?url=... na query string.
 *  - Faz a requisição (axios) para a URL informada.
 *  - Usa cheerio para extrair e "limpar" o conteúdo principal (remove <script>, <style>, etc.).
 *  - Retorna JSON com a 'url' e o 'content' extraído.
 * 
 * OBS: Usamos o padrão Express Router. Adapte conforme necessário.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// GET /api/scraping?url=https://exemplo.com
router.get('/', async (req, res) => {
  // 1) Lê a URL passada via query string
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'A URL é obrigatória.' });
  }

  try {
    // 2) Faz a requisição HTTP (axios) para obter o HTML da página
    const response = await axios.get(url);
    const html = response.data;

    // 3) Carrega o HTML no cheerio
    const $ = cheerio.load(html);

    // 4) Remove elementos que não fazem parte do conteúdo principal
    $('script, style, nav, footer, header').remove();

    // 5) Tenta selecionar o conteúdo principal
    const mainContent = $('main, article, .content').first();
    const text = mainContent.length ? mainContent.text() : $.text();

    // 6) Retorna o JSON com o texto "limpo"
    res.status(200).json({
      url,
      content: text.trim()
    });
  } catch (error) {
    // 7) Em caso de erro, retorna mensagem e detalhes
    res.status(500).json({
      error: 'Falha ao acessar a URL',
      details: error.toString()
    });
  }
});

module.exports = router;
