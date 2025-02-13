/**
 * scrapHelpsinge.js
 * Script Node.js para realizar scraping das páginas do HelpSinge
 * e gerar a knowledgeBase.json.
 */

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Exemplos de objetos e URLs (conforme sua base):
const apresentacao = {
  id: "apresentacao",
  title: "Apresentação",
  url: "https://helpsinge.lince.com.br/apresentacao.html",
  content: "Esta página de apresentação..."
};

// ... Demais objetos do array ...
// (Aqui entrariam todos os arrays: arquiteturaDoSinge, lgpd, etc.)

// Exemplo de uso:
const conhecimentoCompleto = [ apresentacao /*, etc. ...*/ ];

/**
 * Função principal para processar e gerar knowledgeBase.json
 */
async function main() {
  const scrapedData = [];

  // Aqui, simula a lista unificada
  // Exemplo: const URLS = conhecimentoCompleto.concat(...);
  const URLS = conhecimentoCompleto;

  for (const item of URLS) {
    try {
      const resp = await axios.get(item.url);
      const html = resp.data;
      const $ = cheerio.load(html);

      // Removemos scripts e outros elementos desnecessários
      $('script, style, nav, footer, header').remove();

      // Tenta extrair o conteúdo principal
      const mainContent = $('main, article, .content').first();
      const text = mainContent.length ? mainContent.text() : $.text();

      scrapedData.push({
        id: item.id,
        title: item.title,
        url: item.url,
        content: text.trim()
      });

      console.log(`[OK] Sucesso ao carregar: ${item.title}`);
    } catch (err) {
      console.error(`[ERRO] Falha ao carregar: ${item.url}`, err);
      // Se ocorrer erro, adiciona o item com content vazio
      scrapedData.push({
        id: item.id,
        title: item.title,
        url: item.url,
        content: ""
      });
    }
  }

  fs.writeFileSync('src/knowledgeBase.json', JSON.stringify(scrapedData, null, 2), 'utf8');
  console.log("Arquivo knowledgeBase.json gerado com sucesso!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
