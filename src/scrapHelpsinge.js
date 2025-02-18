/**
 * scrapHelpsinge.js
 * Script Node.js para realizar scraping das páginas do HelpSinge
 * e gerar a knowledgeBase.json.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Array de objetos com os links a serem processados:
const knowledgeEntries = [
      {
        "id": "apresentacao",
        "title": "Apresentação",
        "url": "https://helpsinge.lince.com.br/apresentacao.html?ms=AAAAAAAAAAAAAAA%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página de apresentação oferece uma visão geral do sistema HelpSinge, detalhando seus objetivos, funcionalidades e a proposta de valor do projeto. Serve como uma introdução para novos usuários, explicando como o sistema pode contribuir para a gestão e o suporte de processos, além de destacar os principais recursos e benefícios do uso da plataforma."
      },
      {
        "id": "arquitetura-do-singe",
        "title": "Arquitetura do Singe",
        "url": "https://helpsinge.lince.com.br/arquitetura_singe.html?ms=AAAAAAAAAAAAAAA%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta uma visão detalhada da arquitetura central do sistema HelpSinge, explicando os principais componentes, sua interligação e a lógica que sustenta o funcionamento da plataforma."
      },
      {
        "id": "arquitetura-do-singe",
        "title": "Arquitetura do Singe",
        "url": "https://helpsinge.lince.com.br/interface_basica_singe.html?ms=AQAAAAAAAAAAAAAE&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Nesta página é exibida a interface básica do HelpSinge, destacando os elementos de design e usabilidade que facilitam a interação do usuário com o sistema, demonstrando a organização dos menus e funcionalidades essenciais."
      },
      {
        "id": "arquitetura-do-singe",
        "title": "Arquitetura do Singe",
        "url": "https://helpsinge.lince.com.br/configuracoes_minimas.html?ms=AQAAAAAAAAAAAAAE&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página descreve as configurações mínimas necessárias para a implementação do HelpSinge, informando os requisitos técnicos e as especificações básicas que garantem o desempenho adequado e a segurança do sistema."
      },
      {
        "id": "lgpd",
        "title": "LGPD",
        "url": "https://helpsinge.lince.com.br/canais_de_atendimento.html?ms=AQAAAAAAAAAAAAAE&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta os canais de atendimento do HelpSinge, explicando como os usuários podem obter suporte e informações, com atenção especial aos procedimentos e práticas relacionados à proteção de dados, conforme os requisitos da LGPD."
      },
      {
        "id": "lgpd",
        "title": "LGPD",
        "url": "https://helpsinge.lince.com.br/lgpd___lei_geral_de_protecao_de_dados_pessoais__lgpd___lei_n__13_709_2018.html?ms=AwAAAAAAAAAAAAAEAQ%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Nesta página é detalhada a Lei Geral de Proteção de Dados Pessoais (LGPD), Lei nº 13.709/2018, com informações sobre seus principais dispositivos, obrigações e orientações para garantir o tratamento seguro e ético dos dados pessoais no âmbito do HelpSinge."
      },
      {
        "id": "modulos",
        "title": "Módulos",
        "url": "https://helpsinge.lince.com.br/glossario_lgpd.html?ms=AwAAAAAAAAAAAAAEAQ%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta um glossário específico relacionado à LGPD, oferecendo definições e explicações dos termos técnicos utilizados no contexto da proteção de dados. O glossário serve para auxiliar os usuários a compreenderem a terminologia aplicada no sistema HelpSinge."
      },
      {
        "id": "modulos",
        "title": "Módulos",
        "url": "https://helpsinge.lince.com.br/modulos.html?ms=AwAAAAAAAAAAAAAMAQ%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Nesta página são detalhados os módulos do HelpSinge, fornecendo uma visão geral das funcionalidades e dos componentes que compõem o sistema. O conteúdo facilita a compreensão dos diferentes blocos operacionais, permitindo aos usuários identificar e navegar entre as diversas áreas de aplicação."
      },
      {
        "id": "gestao_da_producao",
        "title": "Gestão da Produção",
        "url": "https://helpsinge.lince.com.br/gestao_da_producao.html?ms=AwAAAAAAAAAAAAAMAw%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página aborda a gestão da produção no sistema Singe, apresentando estratégias, indicadores e metodologias para otimização dos processos produtivos."
      },
      {
        "id": "arquitetura_modulo_1",
        "title": "Arquitetura do Módulo 1",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_1.html?ms=AwAAAAAAAAAAAAAMAw%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Página que detalha a arquitetura do Módulo 1, mostrando a estrutura, os componentes e os fluxos de informação que sustentam as operações do sistema de produção."
      },
      {
        "id": "arquitetura_modulo_1_dup",
        "title": "Arquitetura do Módulo 1 (Duplicado)",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_1.html?ms=AwAAAAAAAAAAAAAMAw%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Repetição da página de Arquitetura do Módulo 1, reforçando a estrutura e os componentes essenciais do módulo para a gestão produtiva."
      },
      {
        "id": "consulta_necessidade_materiais",
        "title": "Consulta Necessidade de Materiais para Produção",
        "url": "https://helpsinge.lince.com.br/consulta_necessidade_de_materiais_para_producao_.html?ms=AwAAAAAAAAAAAAAMAw%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página possibilita a consulta das necessidades de materiais para a produção, oferecendo dados para o planejamento e reposição dos insumos utilizados nos processos produtivos."
      },
      {
        "id": "fluxo_producao_maquina_online",
        "title": "Fluxo de Produção de Máquina Online",
        "url": "https://helpsinge.lince.com.br/fluxo_de_producao_de_maquina___on_line_.html?ms=AwAAAAAAAAAAAAAMAw%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Página que descreve o fluxo operacional de produção utilizando máquinas online, com informações sobre as etapas e o monitoramento em tempo real dos processos."
      },
      {
        "id": "textil_1",
        "title": "Textil 1",
        "url": "https://helpsinge.lince.com.br/textil_1.html?ms=EwAAAAAAAAAAAAAMAwE%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Apresenta diretrizes e informações específicas para a produção no setor têxtil, com foco nos processos e controles aplicados para garantir a qualidade dos produtos."
      },
      {
        "id": "ppcp",
        "title": "PPCP",
        "url": "https://helpsinge.lince.com.br/ppcp.html?ms=EwAAAAAAAAAAAAAMAwE%3D&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Esta página trata do Planejamento, Programação e Controle da Produção (PPCP), apresentando métodos e ferramentas para otimizar o fluxo produtivo e garantir a eficiência operacional."
      },
      {
        "id": "textil_tecelagem_1",
        "title": "Textil - Tecelagem 1",
        "url": "https://helpsinge.lince.com.br/textil___tecelagem_1.html?ms=EwAAAAgAAAAAAAAMAwEg&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Página dedicada aos processos de tecelagem no setor têxtil, detalhando os procedimentos operacionais e os controles de qualidade aplicados nesta etapa da produção."
      },
      {
        "id": "planejamento_controle_producao",
        "title": "Planejamento e Controle da Produção",
        "url": "https://helpsinge.lince.com.br/planejamento_e_controle_da_producao.html?ms=EwAAAAgAAAEAAAAMAwEgCA%3D%3D&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Fornece informações sobre os métodos de planejamento e controle aplicados à produção, enfatizando a importância do monitoramento constante e da organização dos processos."
      },
      {
        "id": "textil_fiacao_1",
        "title": "Textil - Fiação 1",
        "url": "https://helpsinge.lince.com.br/textil___fiacao_1.html?ms=EwAAAAgAAAEAAAAMAwEgCA%3D%3D&st=MA%3D%3D&sct=MjY2&mw=MzAw",
        "content": "Detalha os processos de fiação aplicados no setor têxtil, com orientações para a obtenção de fios de alta qualidade e consistência na produção."
      },
      {
        "id": "apontamento_cartas_cep",
        "title": "Apontamento de Controle de Cartas CEP",
        "url": "https://helpsinge.lince.com.br/apontamento_de_controle_de_cartas_cep.html?ms=EwAAAAgAAAEAAAAMAwEgGA%3D%3D&st=MA%3D%3D&sct=MjY2&mw=MzAw",
        "content": "Esta página explica o processo de apontamento e controle de cartas CEP, ferramenta utilizada para monitorar e gerenciar dados operacionais críticos na produção."
      },
      {
        "id": "consulta_objetivo_producao",
        "title": "Consulta Objetivo Realizado pela Produção",
        "url": "https://helpsinge.lince.com.br/consulta_objetivo_realizado_pela_producao_.html?ms=EwAAAAgAAAEAAAAMAwEgGA%3D%3D&st=MA%3D%3D&sct=MjY2&mw=MzAw",
        "content": "Permite a consulta dos objetivos atingidos pela produção, fornecendo dados que auxiliam na avaliação do desempenho e na identificação de oportunidades de melhoria."
      },
      {
        "id": "engenharia_produtos",
        "title": "Engenharia de Produtos",
        "url": "https://helpsinge.lince.com.br/engenharia_de_produtos.html?ms=EwAAAAgAAAEAAAAMAwEgGA%3D%3D&st=MA%3D%3D&sct=MjY2&mw=MzAw",
        "content": "Aborda os processos de engenharia aplicados ao desenvolvimento e aprimoramento de produtos, integrando inovação, pesquisa e controle de qualidade."
      },
      {
        "id": "arquitetura_modulo_2",
        "title": "Arquitetura do Módulo 2",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_2.html?ms=EwAAAAgAAAEAAAAMAwFgGA%3D%3D&st=MA%3D%3D&sct=NDY2&mw=MzAw",
        "content": "Esta página apresenta a estrutura e os componentes do Módulo 2, demonstrando como ele se integra ao sistema para suportar e melhorar os processos produtivos."
      },
      {
        "id": "arquitetura_modulo_2_dup",
        "title": "Arquitetura do Módulo 2 (Duplicado)",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_2.html?ms=EwAAAAgAAAEAAAAMAwFgGA%3D%3D&st=MA%3D%3D&sct=NDY2&mw=MzAw",
        "content": "Duplicação da página de Arquitetura do Módulo 2, com os mesmos detalhes estruturais e funcionais para reforço e consulta."
      },
      {
        "id": "consulta_saldo_estoque",
        "title": "Consulta Saldo por Estoque",
        "url": "https://helpsinge.lince.com.br/consulta_saldo_por_estoque.html?ms=EwAAAAgAAAEAAAAMAwFgWA%3D%3D&st=MA%3D%3D&sct=NDY2&mw=MzAw",
        "content": "Página que permite consultar o saldo disponível em estoque, informação crucial para o controle de insumos e a continuidade da produção."
      },
      {
        "id": "aprontamento_producao",
        "title": "Apontamento de Produção",
        "url": "https://helpsinge.lince.com.br/aprontamento_de_producao.html?ms=EwAAAAgAAAEAAAAMAwFgWA%3D%3D&st=MA%3D%3D&sct=NTY2&mw=MzAw",
        "content": "Esta página registra dados operacionais em tempo real, permitindo o apontamento dos resultados e indicadores da produção para análise e tomada de decisão."
      },
      {
        "id": "cadastro_ficha_tecnica",
        "title": "Cadastro de Ficha Técnica",
        "url": "https://helpsinge.lince.com.br/cadastro_de_ficha_tecnica.html?ms=EwAAAAgAAAEAAAAMAwFgWA%3D%3D&st=MA%3D%3D&sct=NTY2&mw=MzAw",
        "content": "Fornece um formulário para cadastro das fichas técnicas dos produtos, documentando especificações e padrões de qualidade para a fabricação."
      },
      {
        "id": "cadastro_produto_base",
        "title": "Cadastro e Consulta de Produto Base",
        "url": "https://helpsinge.lince.com.br/cadastro_e_consulta_de_produto_base.html?ms=EwAAAAgAAAEAQAAMAwFgWAg%3D&st=MA%3D%3D&sct=NTY2&mw=MzAw",
        "content": "Esta página estabelece o cadastro dos produtos base, servindo como referência para a criação e customização de outros produtos dentro do sistema."
      },
      {
        "id": "cadastro_produtos_1",
        "title": "Cadastro de Produtos 1",
        "url": "https://helpsinge.lince.com.br/cadastro_de_produtos_1.html?ms=EwAAAAgAAAEAQAAMAwFgWAg%3D&st=MA%3D%3D&sct=NTY2&mw=MzAw",
        "content": "Página destinada ao cadastro inicial de produtos, permitindo a inclusão de informações básicas e facilitando a gestão do portfólio produtivo."
      },
      {
        "id": "textil_fiacao_2",
        "title": "Textil - Fiação 2",
        "url": "https://helpsinge.lince.com.br/textil___fiacao_2.html?ms=EwAAAAgAAAEAQAAMAwFgWAg%3D&st=MA%3D%3D&sct=NTY2&mw=MzAw",
        "content": "Complementa a abordagem do setor têxtil, detalhando técnicas avançadas de fiação e estratégias para manter a qualidade e a consistência dos fios produzidos."
      },
      {
        "id": "ativacao_desativacao_produtos",
        "title": "Ativação/Desativação de Produtos",
        "url": "https://helpsinge.lince.com.br/ativacao_desativacao_de_produtos.html?ms=EwAAAAgAAAMAQAAMAwFgWAEI&st=MA%3D%3D&sct=MTA2Ng%3D%3D&mw=MzAw",
        "content": "Página que permite alternar o status dos produtos no sistema, ativando ou desativando itens conforme a demanda de mercado e a estratégia de produção."
      },
      {
        "id": "cadastro_produtos_2",
        "title": "Cadastro de Produtos 2",
        "url": "https://helpsinge.lince.com.br/cadastro_de_produtos_2.html?ms=EwAAAAgAAAMAQAAMAwFgWAEI&st=MA%3D%3D&sct=ODU2&mw=MzAw",
        "content": "Esta interface avança o processo de cadastro de produtos, possibilitando a inserção de informações mais detalhadas e a consulta avançada dos itens cadastrados."
      },
      {
        "id": "consulta_produtos_cor",
        "title": "Consulta de Produtos Atrelados a Uma Cor",
        "url": "https://helpsinge.lince.com.br/consulta_de_produtos_atrelados_a_uma_cor.html?ms=EwAAAAgAAAMAQAAMAwFgWAEI&st=MA%3D%3D&sct=ODU2&mw=MzAw",
        "content": "Oferece uma ferramenta para identificar e consultar produtos que estão associados a cores específicas, auxiliando na organização visual e na gestão de estoque."
      },
      {
        "id": "consulta_receita_polipropileno",
        "title": "Consulta Receita – Polipropileno",
        "url": "https://helpsinge.lince.com.br/consulta_receita___polipropileno_.html?ms=EwAAAAgAAAMAQAAMAwFgWAEI&st=MA%3D%3D&sct=ODU2&mw=MzAw",
        "content": "Apresenta a receita e as formulações para produtos fabricados com polipropileno, essenciais para a padronização e qualidade dos processos de produção."
      },
      {
        "id": "solicitacao_cadastro_alteracao_produto",
        "title": "Solicitação de Cadastro/Alteração de Produto",
        "url": "https://helpsinge.lince.com.br/solicitacao_cadastro_alteracao_de_produto.html?ms=EwAAAAgAAAMAQAAMAwFgWAEI&st=MA%3D%3D&sct=ODU2&mw=MzAw",
        "content": "Esta página permite que os usuários submetam solicitações para o cadastro ou alteração de produtos, integrando a área de produção com a gestão de mudanças."
      },
      {
        "id": "tinturaria",
        "title": "Tinturaria",
        "url": "https://helpsinge.lince.com.br/tinturaria.html?ms=EwAAAAgAAAMAQAAMAwFgWAEI&st=MA%3D%3D&sct=ODU2&mw=MzAw",
        "content": "Página que trata dos processos de tinturaria, detalhando os métodos de coloração e os controles de qualidade aplicados para garantir a uniformidade e a durabilidade das cores nos tecidos."
      },
      {
        "id": "arquitetura_modulo_3",
        "title": "Arquitetura do Módulo 3",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_3.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQ1Ng%3D%3D&mw=MzAw",
        "content": "Esta página apresenta a estrutura do Módulo 3, explicando como suas funcionalidades se integram ao sistema de produção para ampliar as capacidades operacionais."
      },
      {
        "id": "apontamento_desperdicios",
        "title": "Apontamento de Desperdícios",
        "url": "https://helpsinge.lince.com.br/apontamento_de_desperdicios__.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQ1Ng%3D%3D&mw=MzAw",
        "content": "Página destinada ao registro dos desperdícios ocorridos durante a produção, permitindo uma análise detalhada para a implementação de ações corretivas e redução de perdas."
      },
      {
        "id": "acompanhamento_desperdicios",
        "title": "Acompanhamento de Desperdícios",
        "url": "https://helpsinge.lince.com.br/acompanhamento_de_desperdicios.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Fornece ferramentas para o monitoramento contínuo dos desperdícios na produção, contribuindo para a identificação de ineficiências e melhorias nos processos."
      },
      {
        "id": "apontamento_operacoes_utilidades",
        "title": "Apontamento de Operações de Utilidades",
        "url": "https://helpsinge.lince.com.br/apontamento_de_operacoes_de_utilidades.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Esta página documenta as operações de utilidades que ocorrem no ambiente de produção, registrando informações essenciais para o controle e a análise dos serviços de apoio à produção."
      },
      {
        "id": "cadastro_composicao_bicos_estampadoras",
        "title": "Cadastro de Composição de Bicos e Estampadoras",
        "url": "https://helpsinge.lince.com.br/cadastro_composicao_de_bicos_e_estampadoras.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Detalha a composição e a configuração dos bicos e das estampadoras utilizadas na produção têxtil, contribuindo para a padronização e a qualidade do processo de estampagem."
      },
      {
        "id": "cadastro_motivos_desperdicios",
        "title": "Cadastro de Motivos, Causas e Classificação dos Desperdícios",
        "url": "https://helpsinge.lince.com.br/cadastro_de_motivos__causas_e_classificacao_dos_desperdicios.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Esta página estabelece um cadastro detalhado dos motivos, causas e classificações dos desperdícios, possibilitando análises precisas e ações de melhoria contínua na produção."
      },
      {
        "id": "cadastro_operacoes_tingimento",
        "title": "Cadastro de Operações de Processo de Tingimento",
        "url": "https://helpsinge.lince.com.br/cadastro_de_operacoes_de_processo_de_tingimento.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Fornece um registro padronizado para as operações de tingimento, documentando os procedimentos e parâmetros necessários para a correta coloração dos produtos têxteis."
      },
      {
        "id": "cadastrar_produtos_teste_resistencia",
        "title": "Cadastrar Produtos para Teste de Resistência",
        "url": "https://helpsinge.lince.com.br/cadastrar_produtos_para_teste_de_resistencia_.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Esta página permite o cadastro de produtos que serão submetidos a testes de resistência, garantindo que os itens atendam aos padrões de durabilidade e qualidade exigidos."
      },
      {
        "id": "cadastro_receitas",
        "title": "Cadastro de Receitas",
        "url": "https://helpsinge.lince.com.br/cadastro_de_receitas.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Apresenta o cadastro das receitas utilizadas no processo produtivo, detalhando as formulações e os procedimentos que asseguram a consistência na fabricação dos produtos."
      },
      {
        "id": "cadastro_registro_utilidades",
        "title": "Cadastro de Registro de Operações de Utilidades",
        "url": "https://helpsinge.lince.com.br/cadastro_de_registro_de_operacoes_de_utilidades.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Esta página registra as operações de utilidades realizadas na produção, fornecendo um histórico detalhado que auxilia no controle e na análise dessas atividades."
      },
      {
        "id": "controle_pesagem_corante",
        "title": "Controle de Pesagem de Corante",
        "url": "https://helpsinge.lince.com.br/controle_de_pesagem_de_corante_.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Página que descreve os métodos e procedimentos para a pesagem de corantes, etapa fundamental para garantir a dosagem correta e a qualidade na produção têxtil."
      },
      {
        "id": "consulta_manutencao_desperdicios",
        "title": "Consulta e Manutenção de Desperdícios",
        "url": "https://helpsinge.lince.com.br/consulta_e_manutencao_de_desperdicios.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Oferece uma interface para consultar e atualizar os registros de desperdícios na produção, permitindo o monitoramento e a identificação de áreas para redução de perdas."
      },
      {
        "id": "consulta_apontamento_utilidades",
        "title": "Consulta de Apontamento de Registro de Operações de Utilidades",
        "url": "https://helpsinge.lince.com.br/consulta_apontamento_de_registro_de_operacoes_de_utilidades.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "Esta página consolida os registros das operações de utilidades realizadas, facilitando a consulta e o acompanhamento das atividades de suporte à produção."
      },
      {
        "id": "cores_teste_solidez",
        "title": "Cores com Teste de Solidez Obrigatório",
        "url": "https://helpsinge.lince.com.br/cores_com_teste_de_solidez_obrigatorio_.html?ms=EwAAABgAAAMAQAAMAwFgAVgBCA%3D%3D&st=MA%3D%3D&sct=MTQwNg%3D%3D&mw=MzAw",
        "content": "A página apresenta os critérios e os procedimentos para a realização de testes de solidez em cores, garantindo que as tonalidades utilizadas nos produtos mantenham sua integridade e durabilidade."
      },
      {
        "id": "plastico_1",
        "title": "Plástico 1",
        "url": "https://helpsinge.lince.com.br/plastico__1.html?ms=AwAAABgAAAMAQAAMA2ABWAEI&st=MA%3D%3D&sct=MzE%3D&mw=MzAw",
        "content": "Esta página trata das especificações e processos para a produção de itens plásticos, abordando padrões de qualidade e metodologias de fabricação."
      },
      {
        "id": "cadastro_produtos",
        "title": "Cadastro de Produtos",
        "url": "https://helpsinge.lince.com.br/cadastro_de_produtos_.html?ms=EwAAAAAAAAAAAAAMAwI%3D&st=MA%3D%3D&sct=MzEx&mw=MzAw",
        "content": "Interface para o cadastro completo dos produtos, reunindo informações técnicas e operacionais essenciais para a gestão do portfólio produtivo."
      },
      {
        "id": "consulta_cadastro_produtos",
        "title": "Consulta Cadastro de Produtos",
        "url": "https://helpsinge.lince.com.br/consulta_cadastro_de_produtos.html?ms=EwAAAAAAAAAAAAAMAwI%3D&st=MA%3D%3D&sct=MjI3&mw=MzAw",
        "content": "Página que permite consultar os produtos cadastrados, facilitando a verificação, atualização e gestão das informações dos itens produzidos."
      },
      {
        "id": "controle_producao",
        "title": "Controle da Produção",
        "url": "https://helpsinge.lince.com.br/controle_da_producao_.html?ms=EwAAAAAAAAAAAAAMAwI%3D&st=MA%3D%3D&sct=MjI3&mw=MzAw",
        "content": "Fornece indicadores e ferramentas de controle para monitorar a produção, permitindo uma análise em tempo real dos processos e a identificação de oportunidades de melhoria."
      },
      {
        "id": "cadastro_ficha_ocorrencia_producao",
        "title": "Cadastro de Ficha de Ocorrência de Produção",
        "url": "https://helpsinge.lince.com.br/cadastro_de_ficha_de_ocorrencia_de_producao_.html?ms=EwAAABAAAAAAAAAMAwII&st=MA%3D%3D&sct=MjI3&mw=MzAw",
        "content": "Esta página registra ocorrências e incidentes na produção, permitindo a documentação detalhada dos eventos e auxiliando na análise de falhas para aprimoramento dos processos."
      },
      {
        "id": "digitacao_refugo_producao",
        "title": "Digitação de Refugo da Produção",
        "url": "https://helpsinge.lince.com.br/digitacao_de_refugo_da_producao.html?ms=EwAAABAAAAAAAAAMAwII&st=MA%3D%3D&sct=MjI3&mw=MzAw",
        "content": "Interface para a inserção dos dados relativos aos refugos gerados durante a produção, contribuindo para a identificação de perdas e para a melhoria contínua dos processos."
      },
      {
        "id": "movimentacao_materia_prima",
        "title": "Movimentação de Matéria Prima",
        "url": "https://helpsinge.lince.com.br/movimentacao_de_materia_prima.html?ms=EwAAABAAAAAAAAAMAwII&st=MA%3D%3D&sct=MjI3&mw=MzAw",
        "content": "Página que registra a movimentação de matéria-prima, monitorando entradas e saídas para garantir o controle de estoque e a disponibilidade de insumos para a produção."
      },
      {
        "id": "preparacao_materia_prima",
        "title": "Preparação de Matéria Prima",
        "url": "https://helpsinge.lince.com.br/preparacao_de_materia_prima_.html?ms=EwAAABAAAAAAAAAMAwII&st=MA%3D%3D&sct=MjI3&mw=MzAw",
        "content": "Esta página descreve os procedimentos para a preparação da matéria-prima, assegurando que os insumos estejam adequadamente processados e dentro dos padrões de qualidade antes do uso na produção."
      },
      {
        "id": "gestao_da_qualidade",
        "title": "Gestão da Qualidade",
        "url": "https://helpsinge.lince.com.br/gestao_da_qualidade.html?ms=EwAAABAAAAAAAAAMBQII&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta os princípios e práticas da gestão da qualidade no Singe, detalhando os processos, indicadores e estratégias adotados para assegurar a excelência e a conformidade dos produtos e serviços."
      },
      {
        "id": "arquitetura_modulo_4",
        "title": "Arquitetura do Módulo 4",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_4.html?ms=AwAAAAAAAAAAAAAMBQ%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página detalha a estrutura e os componentes do Módulo 4, o qual é dedicado ao controle e monitoramento da qualidade, demonstrando como suas funcionalidades se integram ao sistema geral para suportar a gestão da qualidade."
      },
      {
        "id": "arquitetura_modulo_4_dup",
        "title": "Arquitetura do Módulo 4 (Duplicado)",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_4.html?ms=AwAAAAAAAAAAAAAMBQ%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Repetição da página de Arquitetura do Módulo 4, reforçando a apresentação dos elementos estruturais e funcionais que sustentam a área de qualidade no sistema."
      },
      {
        "id": "controle_testes_texteis",
        "title": "Controle de Testes Texteis",
        "url": "https://helpsinge.lince.com.br/controle_de_testes_texteis_.html?ms=EwAAAAAAAAAAAAAMBQg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página expõe os métodos e critérios utilizados para a realização dos testes têxteis, fundamentais para assegurar que os materiais e produtos do setor têxtil atendam aos padrões de resistência, durabilidade e qualidade."
      },
      {
        "id": "controle_testes_fisicos",
        "title": "Controle de Testes Físicos",
        "url": "https://helpsinge.lince.com.br/controle_de_testes_fisicos.html?ms=EwAAAAAAAAAAAAAMBQg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página detalha os procedimentos de testes físicos aplicados aos produtos, avaliando propriedades como resistência, integridade e outras características essenciais para garantir a conformidade e segurança dos itens produzidos."
      },
      {
        "id": "relatorio_nao_conformidades_1",
        "title": "Relatório de Não Conformidades 1",
        "url": "https://helpsinge.lince.com.br/relatorio_de_nao_conformidades_1.html?ms=EwAAAAAAAAAAAAAMBQg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta um relatório detalhado das não conformidades identificadas nos processos de qualidade, fornecendo dados e insights para a implementação de ações corretivas e a melhoria contínua."
      },
      {
        "id": "plastico_1_qualidade",
        "title": "Plástico 1",
        "url": "https://helpsinge.lince.com.br/plastico_1.html?ms=EwAAAAAAAAAAAAAMBQg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Nesta página são abordados os critérios e métodos de controle de qualidade aplicados aos produtos plásticos, garantindo que os itens fabricados atendam aos padrões exigidos e apresentem desempenho consistente."
      },
      {
        "id": "relatorio_nao_conformidades_2",
        "title": "Relatório de Não Conformidades 2",
        "url": "https://helpsinge.lince.com.br/relatorio_de_nao_conformidades_2.html?ms=EwAAACAAAAAAAAAMBQgE&st=MA%3D%3D&sct=MTAw&mw=MzAw",
        "content": "Esta página fornece um segundo relatório de não conformidades, focando em aspectos críticos e técnicos que impactam a qualidade, para auxiliar na identificação e correção de falhas nos processos."
      },
      {
        "id": "transporte_logistica",
        "title": "Transporte e Logística",
        "url": "https://helpsinge.lince.com.br/transporte_logistica.html?ms=AwAAACAAAAAAAAAMAQQ%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página aborda os processos e estratégias relacionados ao transporte de mercadorias e à gestão logística, incluindo planejamento, execução e monitoramento das operações."
      },
      {
        "id": "arquitetura_modulo_5",
        "title": "Arquitetura do Módulo 5",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_5.html?ms=AwAAAAAAAAAAAAAMCQ%3D%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Nesta página é apresentada a estrutura do Módulo 5, que integra funções essenciais para as operações logísticas, detalhando os componentes que suportam o sistema de transporte e distribuição."
      },
      {
        "id": "plasticos",
        "title": "Plásticos",
        "url": "https://helpsinge.lince.com.br/plasticos.html?ms=AwAAAAAAAAAAAAAMCQ%3D%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Esta página trata do controle e da gestão dos materiais plásticos, abordando os procedimentos de armazenamento, manuseio e controle de qualidade dos itens plásticos usados nas operações logísticas."
      },
      {
        "id": "gestao_estoque_revenda_br470",
        "title": "Acompanhamento de Gestão de Estoque Revenda BR470",
        "url": "https://helpsinge.lince.com.br/acompanhamento_de_gestao_de_estoque_revenda_br470.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Esta página disponibiliza ferramentas e relatórios para o acompanhamento da gestão de estoque destinado à revenda, permitindo monitorar os níveis de mercadorias e as movimentações do estoque."
      },
      {
        "id": "carga_fechada",
        "title": "Carga Fechada",
        "url": "https://helpsinge.lince.com.br/carga_fechada.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Nesta página é explicado o conceito de carga fechada e os procedimentos para a organização e otimização do transporte de cargas consolidadas, visando eficiência e redução de custos."
      },
      {
        "id": "carga_descarga_mercadorias",
        "title": "Carga e Descarga de Mercadorias",
        "url": "https://helpsinge.lince.com.br/_carga_e_descarga_de_mercadorias.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Esta página detalha os procedimentos para a carga e descarga de mercadorias, enfatizando os protocolos de segurança e as melhores práticas para minimizar danos durante o manuseio."
      },
      {
        "id": "consulta_carga_descarga_mercadorias",
        "title": "Consulta de Carga e Descarga de Mercadorias",
        "url": "https://helpsinge.lince.com.br/consulta_carga_e_descarga_de_mercadorias.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Esta página permite a consulta dos registros de carga e descarga de mercadorias, oferecendo dados que auxiliam no controle e na análise das operações logísticas."
      },
      {
        "id": "conferencia_faturas_frete",
        "title": "Conferência e Lançamento de Faturas de Frete",
        "url": "https://helpsinge.lince.com.br/conferencia_e_lancamento_de_faturas_de_frete.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Nesta página são explicados os procedimentos para conferir e lançar faturas de frete, contribuindo para o controle financeiro e a gestão dos custos de transporte."
      },
      {
        "id": "conferencia_verificacao_entregas",
        "title": "Conferência e Verificação de Entregas",
        "url": "https://helpsinge.lince.com.br/conferencia_e_verificacao_de_entregas.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Esta página descreve os métodos para a conferência e verificação das entregas, assegurando que os prazos sejam cumpridos e que as mercadorias cheguem sem danos."
      },
      {
        "id": "consulta_roteiro",
        "title": "Consulta de Roteiro",
        "url": "https://helpsinge.lince.com.br/consulta_de_roteiro.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=NjAw&mw=MzAw",
        "content": "Esta página possibilita a consulta dos roteiros de transporte, permitindo a visualização e o gerenciamento das rotas utilizadas nas operações logísticas."
      },
      {
        "id": "consulta_agendamento_devolucao",
        "title": "Consulta de Agendamento de Devolução",
        "url": "https://helpsinge.lince.com.br/consulta_de_agendamento_de_devolucao.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=NjAw&mw=MzAw",
        "content": "Nesta página, o sistema exibe os agendamentos para devolução de mercadorias, auxiliando na organização e no controle dos retornos de produtos."
      },
      {
        "id": "emissao_carta_de_debito",
        "title": "Emissão de Carta de Débito",
        "url": "https://helpsinge.lince.com.br/emissao_de_carta_de_debito.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=NjAw&mw=MzAw",
        "content": "Esta página descreve o processo para emissão de cartas de débito, utilizadas para registrar e cobrar valores relacionados a fretes e despesas logísticas."
      },
      {
        "id": "consulta_mapa_estoques",
        "title": "Consulta Mapa de Estoques",
        "url": "https://helpsinge.lince.com.br/consulta_mapa_de_estoques_.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=NjAw&mw=MzAw",
        "content": "Esta página apresenta um mapa interativo dos estoques, permitindo a consulta rápida das quantidades e localizações dos produtos armazenados."
      },
      {
        "id": "informacoes_para_embarque",
        "title": "Informações para Embarque",
        "url": "https://helpsinge.lince.com.br/informacoes_para_embarque.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=NjAw&mw=MzAw",
        "content": "Nesta página são fornecidas as informações necessárias para o embarque de mercadorias, incluindo orientações, requisitos e procedimentos que garantem o envio correto dos produtos."
      },
      {
        "id": "manutencao_coletas",
        "title": "Manutenção das Coletas",
        "url": "https://helpsinge.lince.com.br/manutencao_das_coletas.html?ms=EwAAAAAAAAAAAAAMCSA%3D&st=MA%3D%3D&sct=NjAw&mw=MzAw",
        "content": "Esta página aborda os processos para a manutenção das coletas, visando garantir que a retirada de mercadorias seja realizada de forma organizada e eficiente."
      },
      {
        "id": "gestao_vista",
        "title": "Gestão à Vista - Painel de Acompanhamento",
        "url": "https://helpsinge.lince.com.br/gestao_a_vista__tela_tr733___painel_de_acompanhamento_.html?ms=EwAAAAABAAAAAAAMCSAB&st=MA%3D%3D&sct=NjAw&mw=MzAw",
        "content": "Esta página oferece um painel interativo de gestão à vista, exibindo indicadores e relatórios em tempo real que auxiliam no monitoramento e na tomada de decisões logísticas."
      },
      {
        "id": "montagem_carga_roteiro",
        "title": "Montagem de Carga e Cadastro de Roteiro",
        "url": "https://helpsinge.lince.com.br/montagem_de_carga_e_cadastro_de_roteiro.html?ms=EwAAAAABAAAAAAAMCSAB&st=MA%3D%3D&sct=MTEwMA%3D%3D&mw=MzAw",
        "content": "Nesta página são descritos os processos para a montagem de carga e o cadastro de roteiros, permitindo a organização eficaz dos itens a serem transportados e o planejamento das rotas."
      },
      {
        "id": "posicionamento_entregas",
        "title": "Posicionamento de Entregas",
        "url": "https://helpsinge.lince.com.br/posicionamento_de_entregas_.html?ms=EwAAAAABAAAAAAAMCSAB&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Esta página apresenta informações sobre o posicionamento das entregas, facilitando o rastreamento e a verificação da localização dos veículos e cargas durante o transporte."
      },
      {
        "id": "pendencia_missao_estoque",
        "title": "Pendência – Missão de Estoque",
        "url": "https://helpsinge.lince.com.br/pendencia_missao_de_estoque_.html?ms=EwAAAAABAAAAAAAMCSAB&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Esta página exibe as pendências relacionadas à gestão de estoque, permitindo identificar problemas e agir rapidamente para manter os níveis adequados de produtos."
      },
      {
        "id": "separacao_amostras_reposicoes",
        "title": "Separação e Conferência de Amostras e Reposições",
        "url": "https://helpsinge.lince.com.br/separacao_conferencia_de_amostras_e_reposicoes.html?ms=EwAAAAABAAAAAAAMCSAB&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Nesta página são detalhados os procedimentos para a separação, conferência e reposição de amostras, essenciais para garantir a qualidade e a organização do processo logístico."
      },
      {
        "id": "bloqueio_transportadora",
        "title": "Bloqueio e Desbloqueio de Transportadora",
        "url": "https://helpsinge.lince.com.br/bloqueio_e_desbloqueio_de_transportadora.html?ms=EwAAAAABAAAAAAAMCSAB&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Esta página descreve os critérios e os procedimentos para o bloqueio e desbloqueio de transportadoras, como parte do controle operacional e da avaliação de desempenho dos parceiros logísticos."
      },
      {
        "id": "cadastro_transportadora_frete",
        "title": "Cadastro de Transportadora e Cálculo de Frete",
        "url": "https://helpsinge.lince.com.br/cadastro_de_transportadora_e_calculo_de_frete.html?ms=EwAAAAABAAAAAAAMCSAB&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Nesta página é possível cadastrar transportadoras e realizar o cálculo dos fretes, integrando informações que auxiliam na gestão financeira e na otimização dos custos de transporte."
      },
      {
        "id": "anexo1_comparativo_fretes",
        "title": "Anexo 1 – Comparativo de Fretes",
        "url": "https://helpsinge.lince.com.br/anexo_1___comparativo_de_fretes.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Esta página apresenta um comparativo de fretes, permitindo a análise de diferentes cotações e condições, para a escolha da opção mais vantajosa para as operações de transporte."
      },
      {
        "id": "cadastro_ocorrencias_transportes",
        "title": "Cadastro de Ocorrências de Transportes",
        "url": "https://helpsinge.lince.com.br/cadastro_de_ocorrencias_de_transportes.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTQwMA%3D%3D&mw=MzAw",
        "content": "Nesta página, os usuários podem registrar ocorrências e incidentes durante os transportes, contribuindo para a análise de falhas e a implementação de medidas corretivas."
      },
      {
        "id": "carga_descarga_mercadorias_log",
        "title": "Carga e Descarga de Mercadorias",
        "url": "https://helpsinge.lince.com.br/carga_e_descarga_de_mercadorias.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página revisa os processos operacionais de carga e descarga de mercadorias, destacando as melhores práticas para assegurar a integridade dos produtos durante o manuseio."
      },
      {
        "id": "informa_saida_nota",
        "title": "Informação de Saída da Nota Fiscal",
        "url": "https://helpsinge.lince.com.br/informa_data_de_saida_da_nota_fiscal_.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página informa a data de saída das notas fiscais, dados essenciais para o acompanhamento das expedições e para a gestão dos prazos de entrega e obrigações fiscais."
      },
      {
        "id": "informa_entrega_nota",
        "title": "Informação de Entrega da Nota Fiscal",
        "url": "https://helpsinge.lince.com.br/informa_data_de_entrega_na_nota_fiscal.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Nesta página são exibidas as informações referentes à data de entrega das notas fiscais, permitindo o monitoramento do fluxo de mercadorias e o cumprimento dos prazos estabelecidos."
      },
      {
        "id": "libera_estoque_critico",
        "title": "Liberação de Estoque Crítico",
        "url": "https://helpsinge.lince.com.br/libera_estoque_critico_.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página detalha os procedimentos para a liberação de estoque considerado crítico, permitindo que a empresa mantenha níveis ideais de produtos essenciais mesmo em situações de emergência."
      },
      {
        "id": "packing_list_fios",
        "title": "Packing List – Fios Industriais",
        "url": "https://helpsinge.lince.com.br/packing_list_fios_industriais.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta o packing list para os fios industriais, listando especificações, quantidades e a organização dos itens para facilitar a expedição e a conferência dos produtos."
      },
      {
        "id": "programacao_coletas",
        "title": "Programação de Coletas",
        "url": "https://helpsinge.lince.com.br/programacao_de_coletas.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página detalha o processo de programação de coletas, permitindo o agendamento e a coordenação das retiradas de mercadorias, otimizando a eficiência logística."
      },
      {
        "id": "programacao_expedicao_fracionada",
        "title": "Programação da Expedição Fracionada",
        "url": "https://helpsinge.lince.com.br/programacao_da_expedicao_fracionada.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página aborda a expedição fracionada, explicando como as cargas são divididas e organizadas para envio, visando aumentar a eficiência e reduzir os custos de transporte."
      },
      {
        "id": "recebimento_fretes_edi",
        "title": "Recebimento de Fretes por EDI",
        "url": "https://helpsinge.lince.com.br/recebimento_de_fretes_por_edi.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta o sistema de recebimento de fretes via EDI, que automatiza a troca de informações entre parceiros logísticos para agilizar o processamento dos dados de transporte."
      },
      {
        "id": "recebimento_fretes_despesas",
        "title": "Recebimento de Fretes e Despesas Extras",
        "url": "https://helpsinge.lince.com.br/recebimento_de_fretes___despesas_extras_.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página trata do registro e controle dos fretes e das despesas extras, fornecendo informações que auxiliam no acompanhamento dos custos e na análise financeira das operações logísticas."
      },
      {
        "id": "troca_cor_expedicao",
        "title": "Troca de Cor na Expedição",
        "url": "https://helpsinge.lince.com.br/troca_de_cor_na_expedicao.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página explica o processo de troca de cor durante a expedição, uma prática utilizada para facilitar a identificação e a organização das cargas de acordo com categorias ou requisitos específicos."
      },
      {
        "id": "expedicao",
        "title": "Expedição",
        "url": "https://helpsinge.lince.com.br/expedicao.html?ms=MwAAAAABAAAAAAAMCSABAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=MzAw",
        "content": "Esta página reúne informações sobre o processo de expedição, desde a preparação e organização dos produtos até a entrega final, garantindo a eficiência e a segurança nas operações de transporte."
      },
      {
        "id": "arquitetura_modulo_6",
        "title": "Arquitetura do Módulo 6",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_6.html?ms=cwAAAAABAAAAAAAMCSABIAE%3D&st=MA%3D%3D&sct=MTY3MA%3D%3D&mw=MzAw",
        "content": "Esta página descreve a estrutura e os componentes do Módulo 6, que integra funcionalidades avançadas para a gestão logística, proporcionando uma visão detalhada das soluções implementadas para otimizar as operações."
      },
      {
        "id": "consulta_solicitacao_movimento_estoque",
        "title": "Consulta de Solicitação de Movimento de Estoque",
        "url": "https://helpsinge.lince.com.br/consulta_solicitacao_de_movimento_de_estoque_.html?ms=cwAAAAABAAAAAAAMCSABIAE%3D&st=MA%3D%3D&sct=MTY3MA%3D%3D&mw=MzAw",
        "content": "Esta página permite consultar as solicitações de movimento de estoque, exibindo informações sobre as entradas e saídas de produtos e auxiliando no gerenciamento do fluxo de mercadorias."
      },
      {
        "id": "estatisticas_separacao",
        "title": "Estatísticas de Separação",
        "url": "https://helpsinge.lince.com.br/estatisticas_de_separacao_.html?ms=cwAAAAABAAAAAAAMCSABIAE%3D&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=MzAw",
        "content": "Nesta página são apresentadas estatísticas referentes à separação de pedidos e mercadorias, permitindo avaliar a eficiência e identificar oportunidades de melhoria nos processos logísticos."
      },
      {
        "id": "consulta_pendencias_online",
        "title": "Consulta de Pendências Online",
        "url": "https://helpsinge.lince.com.br/consulta_pendencias_on_line.html?ms=cwAAAAABAAAAAAAMCSABIAE%3D&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=MzAw",
        "content": "Esta página disponibiliza uma ferramenta para consulta de pendências nas operações logísticas, facilitando a identificação e a resolução de problemas em tempo real."
      },
      {
        "id": "textil_tecelagem_3",
        "title": "Textil - Tecelagem 3",
        "url": "https://helpsinge.lince.com.br/textil___tecelagem_3.html?ms=cwAAAAABAAAAAAAMCSABIAE%3D&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=MzAw",
        "content": "Esta página aborda aspectos específicos da tecelagem no setor têxtil, apresentando técnicas, controles e processos voltados para otimizar a produção e manter a qualidade dos tecidos."
      },
      {
        "id": "acondicionamento_embalagem",
        "title": "Acondicionamento e Embalagem",
        "url": "https://helpsinge.lince.com.br/acondicionamento_e_embalagem.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTg0Ng%3D%3D&mw=MzAw",
        "content": "Esta página detalha os procedimentos de acondicionamento e embalagem, essenciais para proteger as mercadorias durante o transporte e garantir que cheguem em perfeitas condições."
      },
      {
        "id": "conferencia_expedicao",
        "title": "Conferência de Expedição",
        "url": "https://helpsinge.lince.com.br/conferencia_de_expedicao_.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTcyMQ%3D%3D&mw=MzAw",
        "content": "Esta página descreve os métodos para a conferência das expedições, assegurando que os documentos e as mercadorias estejam de acordo com os registros e os padrões estabelecidos."
      },
      {
        "id": "importacao_ceps",
        "title": "Importação de CEPs",
        "url": "https://helpsinge.lince.com.br/importacao_de_ceps.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTcyMQ%3D%3D&mw=MzAw",
        "content": "Esta página apresenta o processo de importação de CEPs, fundamental para a atualização e manutenção dos dados de endereçamento que suportam as operações logísticas e a entrega de mercadorias."
      },
      {
        "id": "separacao_notas_fiscais",
        "title": "Separação e Conferência de Notas Fiscais",
        "url": "https://helpsinge.lince.com.br/separacao_conferencia_de_notas_fiscais_.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTcyMQ%3D%3D&mw=MzAw",
        "content": "Nesta página são descritos os procedimentos para a separação e conferência de notas fiscais, garantindo a exatidão dos dados e a conformidade dos processos fiscais e logísticos."
      },
      {
        "id": "previsao_saida_notas_magazines",
        "title": "Previsão de Saída de Notas Fiscais de Magazines",
        "url": "https://helpsinge.lince.com.br/previsao_de_saida_notas_fiscais_de_magazines.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTcyMQ%3D%3D&mw=MzAw",
        "content": "Esta página exibe a previsão de saída das notas fiscais destinadas aos magazines, permitindo o planejamento das operações de expedição e o acompanhamento dos prazos fiscais."
      },
      {
        "id": "programacao_aprovacao_coleta",
        "title": "Programação e Aprovação de Coleta de Cargas",
        "url": "https://helpsinge.lince.com.br/programacao_e_aprovacao_de_coleta_de_cargas.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTcyMQ%3D%3D&mw=MzAw",
        "content": "Esta página trata da programação e aprovação das coletas de cargas, detalhando os critérios para o agendamento e a verificação da conformidade dos processos logísticos relacionados à retirada de mercadorias."
      },
      {
        "id": "transferencia_depositos",
        "title": "Transferência entre Depósitos",
        "url": "https://helpsinge.lince.com.br/_transferencia_entre_depositos.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTcyMQ%3D%3D&mw=MzAw",
        "content": "Esta página explica os procedimentos para a transferência de mercadorias entre depósitos, facilitando a redistribuição e o gerenciamento interno dos estoques."
      },
      {
        "id": "textil_fiacao_3",
        "title": "Textil - Fiação 3",
        "url": "https://helpsinge.lince.com.br/textil___fiacao_3.html?ms=cwAAAAADAAAAAAAMCSABIAEI&st=MA%3D%3D&sct=MTcyMQ%3D%3D&mw=MzAw",
        "content": "Esta página apresenta informações sobre a etapa de fiação no setor têxtil, com foco na terceira fase do processo, destacando técnicas e controles para manter a qualidade dos fios produzidos."
      },
      {
        "id": "consulta_estoque_produtos_alternativos",
        "title": "Consulta de Estoque de Produtos e Alternativos",
        "url": "https://helpsinge.lince.com.br/consulta_estoque_de_produtos_e_alternativos_.html?ms=cwAAAAADAAAAAAAMCSABIAEY&st=MA%3D%3D&sct=MjQzMQ%3D%3D&mw=MzAw",
        "content": "Esta página possibilita a consulta detalhada dos estoques, incluindo produtos principais e suas alternativas, permitindo uma visão abrangente para a tomada de decisões logísticas e comerciais."
      },
      {
        "id": "consulta_saldo_movimentacao_deposito",
        "title": "Consulta de Saldo e Movimentação de Depósito",
        "url": "https://helpsinge.lince.com.br/consulta_de_saldo_movimentacao_de_deposito_.html?ms=cwAAAAADAAAAAAAMCSABIAEY&st=MA%3D%3D&sct=MTkxNw%3D%3D&mw=MzAw",
        "content": "Esta página fornece informações detalhadas sobre o saldo e as movimentações nos depósitos, ajudando no controle dos fluxos de entrada e saída de mercadorias."
      },
      {
        "id": "consulta_saldo_estoque_meadeira",
        "title": "Consulta de Saldo – Estoque Meadeira",
        "url": "https://helpsinge.lince.com.br/__consulta_saldo_estoque_meadeira.html?ms=cwAAAAADAAAAAAAMCSABIAEY&st=MA%3D%3D&sct=MTkxNw%3D%3D&mw=MzAw",
        "content": "Esta página é dedicada à consulta do estoque específico da meadeira, permitindo visualizar os níveis e movimentações dos produtos armazenados nesta área."
      },
      {
        "id": "mensagem_para_coletor",
        "title": "Mensagem para Coletor Online",
        "url": "https://helpsinge.lince.com.br/mensagem_para_coletor_on_line.html?ms=cwAAAAADAAAAAAAMCSABIAEY&st=MA%3D%3D&sct=MTkxNw%3D%3D&mw=MzAw",
        "content": "Esta página oferece um canal de comunicação para enviar mensagens ao coletor online, facilitando a resolução de dúvidas e a coordenação de operações durante as coletas."
      },
      {
        "id": "separacao_volumes_circulo",
        "title": "Separação de Volumes – Círculo",
        "url": "https://helpsinge.lince.com.br/separacao_de_volumes___circulo_.html?ms=cwAAAAADAAAAAAAMCSABIAEY&st=MA%3D%3D&sct=MTkxNw%3D%3D&mw=MzAw",
        "content": "Esta página apresenta a técnica de separação de volumes no formato 'círculo', utilizada para otimizar o agrupamento e a organização dos itens para expedição."
      },
      {
        "id": "plastico_2",
        "title": "Plástico 2",
        "url": "https://helpsinge.lince.com.br/plastico_2.html?ms=cwAAAAADAAAAAAAMCSABIAEY&st=MA%3D%3D&sct=MTkxNw%3D%3D&mw=MzAw",
        "content": "Esta página complementa as informações do controle de produtos plásticos, apresentando diretrizes específicas para o segundo grupo de produtos, garantindo qualidade e consistência."
      },
      {
        "id": "consulta_ordem_montagem",
        "title": "Consulta de Ordem de Montagem",
        "url": "https://helpsinge.lince.com.br/consulta_ordem_de_montagem.html?ms=cwAAAAADAAAAAAAMCSABIAE4&st=MA%3D%3D&sct=MjYxNw%3D%3D&mw=MzAw",
        "content": "Esta página permite a consulta das ordens de montagem, exibindo dados sobre o andamento das operações e auxiliando na coordenação dos processos de montagem de cargas ou produtos."
      },
      {
        "id": "consulta_estoque_venda_revenda",
        "title": "Consulta de Estoque – Venda/Revenda",
        "url": "https://helpsinge.lince.com.br/consulta_estoque_venda_revenda.html?ms=cwAAAAADAAAAAAAMCSABIAE4&st=MA%3D%3D&sct=MjA3NQ%3D%3D&mw=MzAw",
        "content": "Esta página exibe informações sobre o estoque disponível para venda e revenda, auxiliando na gestão dos níveis de produtos e no suporte às operações comerciais."
      },
      {
        "id": "consulta_estoque_venda_revenda_dup",
        "title": "Consulta de Estoque – Venda/Revenda (Duplicado)",
        "url": "https://helpsinge.lince.com.br/consulta_estoque_venda_revenda.html?ms=cwAAAAADAAAAAAAMCSABIAE4&st=MA%3D%3D&sct=MjA3NQ%3D%3D&mw=MzAw",
        "content": "Repetição da página de consulta de estoque para venda/revenda, mantendo a disponibilidade das informações conforme configurado no sistema."
      },
      {
        "id": "tipo_movimentacao_estoque",
        "title": "Tipo de Movimentação de Estoque por Usuários",
        "url": "https://helpsinge.lince.com.br/tipo_de_movimentacao_de_estoque_por_usuarios_.html?ms=cwAAAAADAAAAAAAMCSABIAE4&st=MA%3D%3D&sct=MjA3NQ%3D%3D&mw=MzAw",
        "content": "Esta página detalha os diferentes tipos de movimentação de estoque realizados pelos usuários, auxiliando no monitoramento e na auditoria dos fluxos de mercadorias."
      },
      {
        "id": "devolucao",
        "title": "Devolução",
        "url": "https://helpsinge.lince.com.br/devolucao.html?ms=cwAAAAADAAAAAAAMCSABIAE4&st=MA%3D%3D&sct=MjA3NQ%3D%3D&mw=MzAw",
        "content": "Esta página trata dos processos de devolução de mercadorias, descrevendo os procedimentos para o retorno dos produtos e a regularização dos estoques."
      },
      {
        "id": "arquitetura_modulo_7",
        "title": "Arquitetura do Módulo 7",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_7.html?ms=cwAAAAADAAAAAAAMCSABYAE4&st=MA%3D%3D&sct=Mjg3NQ%3D%3D&mw=MzAw",
        "content": "Esta página apresenta a estrutura do Módulo 7, que agrega funções específicas para a gestão logística, complementando os demais módulos e otimizando a coordenação das operações."
      },
      {
        "id": "entrada_devolucoes",
        "title": "Entrada das Devoluções",
        "url": "https://helpsinge.lince.com.br/entrada_das_devolucoes.html?ms=cwAAAAADAAAAAAAMCSABYAE4&st=MA%3D%3D&sct=Mjg3NQ%3D%3D&mw=MzAw",
        "content": "Nesta página são registradas as entradas das devoluções, integrando os dados de retorno de produtos ao sistema de controle de estoque."
      },
      {
        "id": "financeiro_home",
        "title": "Financeiro",
        "url": "https://helpsinge.lince.com.br/financeiro.html?ms=cwAAAAADAAAAAAAMASABYAE4&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página apresenta a visão geral do setor financeiro, incluindo indicadores e ferramentas para o controle do fluxo de caixa e a gestão dos recursos financeiros."
      },
      {
        "id": "arquitetura_modulo_8",
        "title": "Arquitetura do Módulo 8",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_8.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=MzE1&mw=MzAw",
        "content": "Página que detalha a estrutura e a integração das funcionalidades do Módulo 8, focado em soluções financeiras e operacionais para suporte à gestão financeira."
      },
      {
        "id": "abatimento_estornos_recebimento",
        "title": "Abatimento e Estornos de Recebimento",
        "url": "https://helpsinge.lince.com.br/abatimento_e_estornos_de_recebimento.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=MzE1&mw=MzAw",
        "content": "Esta página explica os processos e regras para efetuar abatimentos e estornos nos recebimentos, possibilitando ajustes nos valores a receber."
      },
      {
        "id": "acompanhamento_liquidez_diaria",
        "title": "Acompanhamento da Liquidez Diária",
        "url": "https://helpsinge.lince.com.br/acompanhamento_da_liquidez_diaria_.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=MzE1&mw=MzAw",
        "content": "Página que apresenta gráficos e indicadores relacionados à liquidez diária, auxiliando na análise do fluxo de caixa e na tomada de decisões financeiras."
      },
      {
        "id": "analise_credito_cliente",
        "title": "Análise de Crédito – Cliente",
        "url": "https://helpsinge.lince.com.br/analise_de_credito___cliente.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=MzE1&mw=MzAw",
        "content": "Esta página oferece ferramentas para análise de crédito dos clientes, avaliando o risco e a capacidade de pagamento para apoiar decisões comerciais."
      },
      {
        "id": "analise_pedidos",
        "title": "Análise de Pedidos",
        "url": "https://helpsinge.lince.com.br/analise_de_pedidos_.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=MzE1&mw=MzAw",
        "content": "Página destinada à análise de pedidos, apresentando dados e relatórios que ajudam na identificação de tendências e na otimização dos processos de vendas."
      },
      {
        "id": "autorizacao_pagamentos",
        "title": "Autorização de Pagamentos",
        "url": "https://helpsinge.lince.com.br/autorizacao_de_pagamentos.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NTE1&mw=MzAw",
        "content": "Esta página detalha o processo de autorização de pagamentos, definindo critérios e fluxos para validar transações financeiras antes de seu processamento."
      },
      {
        "id": "avisos_lancamentos_representante",
        "title": "Avisos de Lançamentos a Representante",
        "url": "https://helpsinge.lince.com.br/avisos_de_lancamentos_a_representante.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NTE1&mw=MzAw",
        "content": "Página que exibe notificações e avisos sobre lançamentos financeiros destinados aos representantes, contribuindo para a comunicação e a transparência dos processos."
      },
      {
        "id": "baixa_duplicata_verbas_1",
        "title": "Baixa de Duplicata de Verbas",
        "url": "https://helpsinge.lince.com.br/baixa_de_duplicata_de_verbas.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NzE1&mw=MzAw",
        "content": "Esta página explica os procedimentos para baixa de duplicatas relativas a verbas, facilitando o controle e a reconciliação dos pagamentos."
      },
      {
        "id": "baixa_duplicata_verbas_2",
        "title": "Baixa de Duplicata de Verbas (Duplicado)",
        "url": "https://helpsinge.lince.com.br/baixa_de_duplicata_de_verbas.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NzE1&mw=MzAw",
        "content": "Repetição da página de baixa de duplicata de verbas para garantir a consistência dos dados e permitir múltiplas referências, conforme a configuração do sistema."
      },
      {
        "id": "baixa_duplicatas_fornecedor",
        "title": "Baixa de Duplicatas – Fornecedor",
        "url": "https://helpsinge.lince.com.br/baixa_de_duplicatas_fornecedor.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NzE1&mw=MzAw",
        "content": "Esta página detalha os procedimentos para registrar a baixa de duplicatas emitidas para fornecedores, facilitando o acompanhamento dos pagamentos e a gestão das obrigações."
      },
      {
        "id": "cadastro_bancario",
        "title": "Cadastro Bancário",
        "url": "https://helpsinge.lince.com.br/cadastro_bancario.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NzE1&mw=MzAw",
        "content": "Página dedicada ao cadastro de informações bancárias, essenciais para a realização de transações e a integração do sistema financeiro com os bancos parceiros."
      },
      {
        "id": "cadastro_tipos_contas",
        "title": "Cadastro de Tipos de Contas",
        "url": "https://helpsinge.lince.com.br/cadastro_de_tipos_de_contas.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NzE1&mw=MzAw",
        "content": "Esta página permite o cadastro e a categorização dos tipos de contas, facilitando a organização e a análise das transações financeiras."
      },
      {
        "id": "cadastro_parametros_contas",
        "title": "Cadastro de Parâmetros de Contas a Pagar, Receber e Comissões",
        "url": "https://helpsinge.lince.com.br/cadastro_de_parametros_de_contas_a_pagar__contas_a_receber_e_comissoes.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=NzE1&mw=MzAw",
        "content": "Página que define os parâmetros para a gestão das contas a pagar, a receber e para o cálculo de comissões, padronizando os processos financeiros."
      },
      {
        "id": "cadastro_parametros_financeiros",
        "title": "Cadastro de Parâmetros Financeiros",
        "url": "https://helpsinge.lince.com.br/cadastro_de_parametros_financeiros.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=ODE1&mw=MzAw",
        "content": "Esta página permite configurar os parâmetros financeiros que regem as operações, integrando variáveis para a automação e consistência dos processos contábeis."
      },
      {
        "id": "cadastro_emprestimos_financiamentos",
        "title": "Cadastro de Empréstimos e Financiamentos",
        "url": "https://helpsinge.lince.com.br/cadastro_de_emprestimos_e_financiamentos_.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=ODE1&mw=MzAw",
        "content": "Nesta página são gerenciadas informações sobre empréstimos e financiamentos, facilitando o controle das operações de crédito e a análise dos custos financeiros."
      },
      {
        "id": "cobranca_eletronica",
        "title": "Cobrança Eletrônica",
        "url": "https://helpsinge.lince.com.br/cobranca_eletronica_.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=ODE1&mw=MzAw",
        "content": "Página que apresenta o sistema de cobrança eletrônica, demonstrando como as transações financeiras são automatizadas para maior eficiência e segurança."
      },
      {
        "id": "consulta_baixa_duplicatas",
        "title": "Consulta, Baixa e Prorrogação de Duplicatas",
        "url": "https://helpsinge.lince.com.br/consulta__baixa_e_prorrogacao_de_duplicatas.html?ms=AwAAAAAAAAAAAAAMEQ%3D%3D&st=MA%3D%3D&sct=ODE1&mw=MzAw",
        "content": "Esta página oferece uma ferramenta para consultar, baixar e prorrogar duplicatas, integrando dados que auxiliam na reconciliação financeira e no gerenciamento dos títulos."
      },
      {
        "id": "alteracao_duplicatas",
        "title": "Alteração de Duplicatas em Cobrança",
        "url": "https://helpsinge.lince.com.br/alteracao_de_duplicatas_em_cobranca.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=ODE1&mw=MzAw",
        "content": "Nesta página são descritos os procedimentos para alterar duplicatas em processo de cobrança, permitindo a correção de informações financeiras de forma segura."
      },
      {
        "id": "concessao_abatimentos",
        "title": "Concessão de Abatimentos e Alteração do Portador",
        "url": "https://helpsinge.lince.com.br/_concessao_de_abatimentos_e_alteracao_do_portador.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTMxNQ%3D%3D&mw=MzAw",
        "content": "Esta página detalha os processos para a concessão de abatimentos e para alterar o portador dos títulos, contribuindo para ajustes financeiros e maior flexibilidade no controle dos recebíveis."
      },
      {
        "id": "consulta_fluxo_caixa",
        "title": "Consulta Fluxo de Caixa – Moeda Estrangeira",
        "url": "https://helpsinge.lince.com.br/consulta_fluxo_de_caixa___moeda_estrangeira.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Página que apresenta o fluxo de caixa em moeda estrangeira, permitindo a análise das movimentações financeiras internacionais e a gestão dos riscos cambiais."
      },
      {
        "id": "consulta_duplicatas_cliente",
        "title": "Consulta de Duplicatas – Cliente",
        "url": "https://helpsinge.lince.com.br/consulta_de_duplicatas___cliente_.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Esta página disponibiliza a consulta das duplicatas emitidas para clientes, oferecendo informações essenciais para o controle dos recebíveis e a análise de inadimplência."
      },
      {
        "id": "consulta_inadimplencia",
        "title": "Consulta Inadimplência por Faixas",
        "url": "https://helpsinge.lince.com.br/consulta_inadimplencia_por_faixas.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Nesta página são apresentadas estatísticas de inadimplência segmentadas por faixas, possibilitando a identificação de padrões de risco e a definição de estratégias de cobrança."
      },
      {
        "id": "comissao_duplicata",
        "title": "Comissão por Duplicata",
        "url": "https://helpsinge.lince.com.br/comissao_por_duplicata.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Esta página detalha o cálculo de comissões por duplicata, integrando informações de vendas e pagamentos para suportar a remuneração de representantes e equipes comerciais."
      },
      {
        "id": "dossie_cobranca",
        "title": "Dossiê de Cobrança",
        "url": "https://helpsinge.lince.com.br/dossie_de_cobranca.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Página que compila documentos e registros referentes à cobrança, funcionando como um dossiê para auditoria e análise das transações financeiras."
      },
      {
        "id": "duplicatas_a_pagar_fornecedor",
        "title": "Duplicatas a Pagar – Fornecedor",
        "url": "https://helpsinge.lince.com.br/duplicatas_a_pagar___fornecedor_.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Esta página mostra as duplicatas a pagar aos fornecedores, facilitando a conciliação e o controle das obrigações financeiras com os parceiros comerciais."
      },
      {
        "id": "inclusao_duplicatas",
        "title": "Inclusão de Duplicatas (C/A P)",
        "url": "https://helpsinge.lince.com.br/inclusao_de_duplicatas_c_a_p.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Página que permite a inclusão de novas duplicatas no sistema, registrando transações e facilitando a gestão dos créditos a receber."
      },
      {
        "id": "inclusao_estorno_aviso",
        "title": "Inclusão e Estorno de Aviso de Lançamentos",
        "url": "https://helpsinge.lince.com.br/inclusao_e_estorno_de_aviso_de_lancamentos_.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Esta página explica o processo de inclusão e estorno de avisos de lançamentos, permitindo ajustes nos registros financeiros quando necessário."
      },
      {
        "id": "movimentacao_moeda_estrangeira",
        "title": "Movimentação de Moeda Estrangeira",
        "url": "https://helpsinge.lince.com.br/movimentacao_de_moeda_estrangeira.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Página que detalha os procedimentos para movimentação de moeda estrangeira, integrando informações sobre operações internacionais e controle de câmbio."
      },
      {
        "id": "varredura_dda",
        "title": "Varredura DDA",
        "url": "https://helpsinge.lince.com.br/varredura_dda.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Esta página apresenta o processo de varredura DDA, que automatiza a identificação de débitos diretos, otimizando a cobrança e a gestão financeira."
      },
      {
        "id": "velocidade_estoque",
        "title": "Velocidade do Estoque",
        "url": "https://helpsinge.lince.com.br/velocidade_do_estoque.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Página que exibe indicadores sobre a rotatividade do estoque, fundamentais para a gestão de inventário e a previsão de necessidades financeiras."
      },
      {
        "id": "gestao_viagem",
        "title": "Gestão de Viagem",
        "url": "https://helpsinge.lince.com.br/gestao_de_viagem.html?ms=AwQAAAAAAAAAAAAMEQQ%3D&st=MA%3D%3D&sct=MTA1Mg%3D%3D&mw=MzAw",
        "content": "Esta página trata do gerenciamento de viagens, apresentando ferramentas para planejamento, controle e análise dos custos relacionados aos deslocamentos corporativos."
      },
      {
        "id": "arquitetura_modulo_9",
        "title": "Arquitetura do Módulo 9",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_9.html?ms=AxQAAAAAAAAAAAAMEQQB&st=MA%3D%3D&sct=MTQ1Mg%3D%3D&mw=MzAw",
        "content": "Página que detalha a estrutura do Módulo 9, integrando soluções e fluxos específicos para operações financeiras, com foco na automação e controle de processos."
      },
      {
        "id": "cadastro_fluxo_aprovacao_viagens",
        "title": "Cadastro de Fluxo de Aprovação de Viagens",
        "url": "https://helpsinge.lince.com.br/cadastro_de_fluxo_de_aprovacao_de_viagens_.html?ms=AxQAAAAAAAAAAAAMEQQB&st=MA%3D%3D&sct=MTQ1Mg%3D%3D&mw=MzAw",
        "content": "Esta página permite o cadastro e configuração dos fluxos de aprovação de viagens, estabelecendo etapas e responsáveis para o controle das operações de deslocamento."
      },
      {
        "id": "cadastro_viagens_internacionais",
        "title": "Cadastro de Viagens Internacionais e Nacionais",
        "url": "https://helpsinge.lince.com.br/cadastro_de_viagens_internacionais_e_nacionais_.html?ms=AxQAAAAAAAAAAAAMEQQB&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=MzAw",
        "content": "Nesta página são cadastradas informações detalhadas sobre viagens, tanto internacionais quanto nacionais, para melhor organização e controle das despesas e rotas."
      },
      {
        "id": "consulta_solicitacao_viagem",
        "title": "Consulta de Solicitação de Viagem",
        "url": "https://helpsinge.lince.com.br/consulta_solicitacao_de_viagem.html?ms=AxQAAAAEAAAAAAAMEQQBIA%3D%3D&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=MzAw",
        "content": "Esta página disponibiliza uma ferramenta para a consulta das solicitações de viagem, permitindo verificar o status, os detalhes e os históricos dos pedidos realizados."
      },
      {
        "id": "relatorio_viagem",
        "title": "Relatório de Viagem",
        "url": "https://helpsinge.lince.com.br/relatorio_de_viagem.html?ms=AxQAAAAEAAAAAAAMEQQBIA%3D%3D&st=MA%3D%3D&sct=MTY4OA%3D%3D&mw=MzAw",
        "content": "Página que apresenta um relatório consolidado das viagens realizadas, com dados e métricas essenciais para a análise de desempenho e o controle dos custos."
      },
      {
        "id": "consulta_relatorio_viagem",
        "title": "Consulta de Relatório de Viagem",
        "url": "https://helpsinge.lince.com.br/consulta_relatorio_de_viagem.html?ms=AxQAAAAEAAAAAAAMEQQBYA%3D%3D&st=MA%3D%3D&sct=MTMyOA%3D%3D&mw=MzAw",
        "content": "Esta página permite consultar os relatórios de viagem previamente gerados, facilitando a análise histórica e o acompanhamento dos resultados operacionais."
      },
      {
        "id": "aprovacao_relatorio_viagens",
        "title": "Aprovação de Relatório de Viagens",
        "url": "https://helpsinge.lince.com.br/aprovacao_de_relatorio_de_viagens_.html?ms=AxQAAAAEAAAAAAAMEQQBYA%3D%3D&st=MA%3D%3D&sct=MTgyOA%3D%3D&mw=MzAw",
        "content": "Página destinada à aprovação dos relatórios de viagem, onde gestores podem validar e autorizar os registros de despesas e operações realizadas."
      },
      {
        "id": "consulta_fluxo_aprovacao_viagem",
        "title": "Consulta Fluxo de Aprovação de Viagem",
        "url": "https://helpsinge.lince.com.br/consulta_fluxo_de_aprovacao_de_viagem.html?ms=AxQAAAAMAAAAAAAMEQQBYAE%3D&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Esta página apresenta o fluxo de aprovação de viagens, mostrando as etapas e os responsáveis pelo processo, permitindo o acompanhamento detalhado das autorizações."
      },
      {
        "id": "relatorio_reembolso_despesas",
        "title": "Relatório de Reembolso de Despesas",
        "url": "https://helpsinge.lince.com.br/relatorio_de_reembolso_de_despesas.html?ms=AxQAAAAMAAAAAAAMEQQBYAE%3D&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Página que exibe um relatório sobre os reembolsos de despesas, possibilitando a análise dos custos e o controle financeiro relacionado a viagens e operações."
      },
      {
        "id": "plasticos_financeiro_1",
        "title": "Plasticos (Financeiro) - 1",
        "url": "https://helpsinge.lince.com.br/plasticos_.html?ms=AxQAAAAMAAAAAAAMEQQBYAE%3D&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Esta página trata do controle dos materiais plásticos sob a ótica financeira, relacionando custos e movimentações para integrar o controle de estoque aos processos financeiros."
      },
      {
        "id": "plasticos_financeiro_2",
        "title": "Plasticos (Financeiro) - 2",
        "url": "https://helpsinge.lince.com.br/plasticos_.html?ms=AxQAAAAMAAAAAAAMEQQBYAE%3D&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Repetição da página de controle dos materiais plásticos, garantindo a consistência e a disponibilidade dos dados para análises financeiras."
      },
      {
        "id": "contabilidade_home",
        "title": "Contabilidade",
        "url": "https://helpsinge.lince.com.br/contabilidade.html?ms=AxQAAAAMAAAAAAAIAQQDYAE%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Página principal do módulo de Contabilidade, apresentando uma visão geral dos processos contábeis, relatórios e ferramentas de gestão financeira."
      },
      {
        "id": "arquitetura_modulo_10",
        "title": "Arquitetura do Módulo 10",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_10.html?ms=AwAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Esta página detalha a arquitetura do Módulo 10, que integra os processos contábeis e a infraestrutura de sistemas para a gestão financeira."
      },
      {
        "id": "plastico_2_contabilidade",
        "title": "Plástico 2 (Contabilidade)",
        "url": "https://helpsinge.lince.com.br/plastico__2.html?ms=AwAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Exibe elementos gráficos ou módulos relacionados ao controle contábil, servindo como parte da interface de gestão contábil."
      },
      {
        "id": "cadastro_natureza_contabil",
        "title": "Cadastro da Natureza Contábil para Faturamento",
        "url": "https://helpsinge.lince.com.br/cadastro_da_natureza_contabil_para_faturamento_.html?ms=AxAAAAAAAAAAAAAIIAg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Permite o cadastro e a configuração da natureza contábil utilizada para o faturamento, organizando os registros financeiros conforme a classificação contábil."
      },
      {
        "id": "textil_tecelagem_contabilidade",
        "title": "Textil - Tecelagem (Contabilidade)",
        "url": "https://helpsinge.lince.com.br/textil___tecelagem_.html?ms=AxAAAAAAAAAAAAAIIAg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Apresenta informações específicas sobre os processos contábeis aplicados ao setor têxtil/tecelagem, integrando dados operacionais à gestão contábil."
      },
      {
        "id": "cadastro_natureza_contabil_1",
        "title": "Cadastro de Natureza Contábil para Faturamento 1",
        "url": "https://helpsinge.lince.com.br/cadastro_de_natureza_contabil_para_faturamento_1.html?ms=AxAAAAAAAAAAAAAIIBg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Fornece uma interface para o cadastro de naturezas contábeis, fundamentais para a correta classificação dos lançamentos de faturamento."
      },
      {
        "id": "apuracao_contabil",
        "title": "Apuração Contábil",
        "url": "https://helpsinge.lince.com.br/apuracao_contabil.html?ms=AxAAAAAAAAAAAAAIIBg%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Exibe os métodos e processos para a apuração contábil, consolidando os dados financeiros e permitindo a elaboração dos balanços."
      },
      {
        "id": "apuracao_icms",
        "title": "Apuração de ICMS",
        "url": "https://helpsinge.lince.com.br/apuracao_de_icms.html?ms=AxAAAAAAAAAAAAAIIBg%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Detalha o processo de apuração do ICMS, incluindo as regras de cálculo e a integração com o sistema fiscal."
      },
      {
        "id": "bens_patrimonio_ciap",
        "title": "Bens de Patrimônio para CIAP",
        "url": "https://helpsinge.lince.com.br/bens_de_patrimonio_para_ciap.html?ms=AxAAAAAAAAAAAAAIIBg%3D&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Gerencia os bens patrimoniais destinados ao CIAP, permitindo o controle, a avaliação e o registro dos ativos da empresa."
      },
      {
        "id": "carga_valor_icms_ciap",
        "title": "Carga do Valor do ICMS para CIAP",
        "url": "https://helpsinge.lince.com.br/carga_do_valor_do_icms_para_ciap.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=MzAw&mw=MzAw",
        "content": "Apresenta o processo de integração do valor do ICMS no CIAP, garantindo a consistência dos registros fiscais e contábeis."
      },
      {
        "id": "cadastro_apropriacao_exercicio",
        "title": "Cadastro de Apropriação do Próximo Exercício",
        "url": "https://helpsinge.lince.com.br/cadastro_de_apropriacao_do_proximo_exercicio.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=NDQ3&mw=MzAw",
        "content": "Permite o cadastro das apropriações planejadas para o próximo exercício, auxiliando na projeção e organização dos lançamentos futuros."
      },
      {
        "id": "contas_composicao_sif",
        "title": "Cadastro de Contas e Composição das Contas do SIF",
        "url": "https://helpsinge.lince.com.br/cadastro_de_contas_e_composicao_das_contas_do_sif_.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=NDQ3&mw=MzAw",
        "content": "Esta página organiza as contas do SIF, permitindo o cadastro e a composição dos registros contábeis para a correta apresentação dos resultados financeiros."
      },
      {
        "id": "cadastro_forncedor_notas",
        "title": "Cadastro de Fornecedor para Controle de Notas Fiscais",
        "url": "https://helpsinge.lince.com.br/cadastro_de_forncedor_para_controle_de_notas_fiscais_.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=NDQ3&mw=MzAw",
        "content": "Permite o cadastro de fornecedores, focando no controle e acompanhamento das notas fiscais emitidas, para uma gestão integrada dos débitos e créditos."
      },
      {
        "id": "cadastro_parametros_contabeis",
        "title": "Cadastro de Parâmetros Contábeis",
        "url": "https://helpsinge.lince.com.br/cadastro_de_parametros_contabeis.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=NDQ3&mw=MzAw",
        "content": "Define os parâmetros contábeis que padronizam os lançamentos financeiros, essenciais para a automação e a integridade dos registros."
      },
      {
        "id": "cadastro_centros_custo",
        "title": "Cadastro de Centros de Custo",
        "url": "https://helpsinge.lince.com.br/cadastro_de_centros_de_custo.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=NDQ3&mw=MzAw",
        "content": "Esta página permite o cadastro e a administração dos centros de custo, fundamentais para a alocação e o controle das despesas."
      },
      {
        "id": "cadastro_contas_contabeis",
        "title": "Cadastro de Contas Contábeis",
        "url": "https://helpsinge.lince.com.br/cadastro_de_contas_contabeis.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=NDQ3&mw=MzAw",
        "content": "Fornece uma interface para o cadastro das contas contábeis, organizando os registros financeiros de acordo com as normas contábeis vigentes."
      },
      {
        "id": "cadastro_natureza_operacoes",
        "title": "Cadastro de Natureza de Operações",
        "url": "https://helpsinge.lince.com.br/cadastro_de_natureza_de_operacoes.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=NDQ3&mw=MzAw",
        "content": "Esta página permite o cadastro das naturezas de operações, facilitando a classificação dos lançamentos contábeis e a análise financeira."
      },
      {
        "id": "cadastro_natureza_contabil_2",
        "title": "Cadastro de Natureza Contábil para Faturamento 2",
        "url": "https://helpsinge.lince.com.br/cadastro_de_natureza_contabil_para_faturamento_2.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Complementa o cadastro de naturezas contábeis para faturamento, permitindo a inclusão de categorias adicionais para melhor organização dos registros."
      },
      {
        "id": "cadastro_contas_despesas_viagens",
        "title": "Cadastro de Contas de Despesas de Viagens",
        "url": "https://helpsinge.lince.com.br/cadastro_de_contas_de_despesas_de_viagens.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Permite o cadastro de contas específicas para despesas de viagens, facilitando o controle e a análise dos custos de deslocamento."
      },
      {
        "id": "composicao_demonstracoes",
        "title": "Composição das Demonstrações Contábeis",
        "url": "https://helpsinge.lince.com.br/composicao_das_demonstracoes_contabeis__.html?ms=AzAAAAAAAAAAAAAIIBgB&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Detalha como são compostas as demonstrações contábeis, integrando informações financeiras para a apresentação dos resultados da empresa."
      },
      {
        "id": "cgr012_balanco",
        "title": "CGR012 – Balanço e Demonstrações de Resultado",
        "url": "https://helpsinge.lince.com.br/cgr012___balanco_e_demonstracoes_de_resultado_.html?ms=A3AAAAAAAAAAAAAIIBgBCA%3D%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Apresenta a metodologia e os procedimentos para elaboração do balanço e das demonstrações de resultado, conforme as normas do CGR012."
      },
      {
        "id": "conciliacao_bancaria",
        "title": "Conciliação Bancária",
        "url": "https://helpsinge.lince.com.br/conciliacao_bancaria_.html?ms=A3AAAAAAAAAAAAAIIBgBCA%3D%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Fornece as regras e ferramentas para a conciliação dos extratos bancários com os registros contábeis, garantindo a integridade dos dados financeiros."
      },
      {
        "id": "consulta_natureza_nao_utilizada",
        "title": "Consulta de Natureza de Operação – Não Utilizada",
        "url": "https://helpsinge.lince.com.br/consulta_natureza_de_operacao____nao_utilizada_.html?ms=A3AAAAAAAAAAAAAIIBgBCA%3D%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Permite identificar naturezas de operação que não estão sendo utilizadas, ajudando na limpeza e otimização dos cadastros contábeis."
      },
      {
        "id": "consulta_saldo_proposta_investimento",
        "title": "Consulta de Saldo de Proposta de Investimento",
        "url": "https://helpsinge.lince.com.br/consulta_saldo_de_proposta_de_investimento__.html?ms=A3AAAAAAAAAAAAAIIBgBCA%3D%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Exibe o saldo disponível para propostas de investimento, possibilitando a análise da capacidade financeira para novos projetos."
      },
      {
        "id": "cria_relacao_usuario_centro",
        "title": "Cria Relação Usuário x Centro de Custo",
        "url": "https://helpsinge.lince.com.br/cria_relacao_usuario_centro_de_custo_.html?ms=A3AAAAAAAAAAAAAIIBgBCA%3D%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Facilita a associação entre usuários e centros de custo, permitindo uma alocação mais precisa das despesas e maior controle financeiro."
      },
      {
        "id": "informacoes_credito_decip",
        "title": "Informações de Crédito para DECIPE",
        "url": "https://helpsinge.lince.com.br/informacoes_de_credito_para_decip.html?ms=A3AAAAAAAAAAAAAIIBgBCA%3D%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Apresenta dados e análises de crédito específicos para o DECIPE, auxiliando na avaliação de riscos e na tomada de decisões financeiras."
      },
      {
        "id": "manutencao_informacoes_dime",
        "title": "Manutenção das Informações da DIME",
        "url": "https://helpsinge.lince.com.br/manutencao_das_informacoes_da_dime.html?ms=A3AAAAAAAAAAAAAIIBgBCA%3D%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Permite atualizar e manter as informações referentes à DIME, garantindo que os registros fiscais e contábeis estejam sempre atualizados."
      },
      {
        "id": "cgr051_emissao_dime",
        "title": "CGR051 – Emissão da DIME",
        "url": "https://helpsinge.lince.com.br/cgr051___emissao_da_dime.html?ms=A3ABAAAAAAAAAAAIIBgBCAQ%3D&st=MA%3D%3D&sct=ODQ3&mw=MzAw",
        "content": "Descreve o processo de emissão da DIME de acordo com o padrão CGR051, essencial para a conformidade fiscal da empresa."
      },
      {
        "id": "cgr051_emissao_dime_mensal",
        "title": "CGR051 – Emissão da DIME Mensal",
        "url": "https://helpsinge.lince.com.br/cgr051___emissao_da_dime___mensal.html?ms=A3ABAAAAAAAAAAAIIBgBCAQ%3D&st=MA%3D%3D&sct=MTM0Nw%3D%3D&mw=MzAw",
        "content": "Apresenta a emissão mensal da DIME, com detalhes sobre a consolidação dos dados fiscais para o período."
      },
      {
        "id": "cgr051_emissao_dime_mensal_dup",
        "title": "CGR051 – Emissão da DIME Mensal (Duplicado)",
        "url": "https://helpsinge.lince.com.br/cgr051___emissao_da_dime___mensal.html?ms=A3ABAAAAAAAAAAAIIBgBCAQ%3D&st=MA%3D%3D&sct=MTM0Nw%3D%3D&mw=MzAw",
        "content": "Duplicata da página de emissão mensal da DIME, garantindo redundância e consistência na apresentação das informações."
      },
      {
        "id": "parametros_escrituracao_fiscal",
        "title": "Parâmetros para Escrituracão Fiscal",
        "url": "https://helpsinge.lince.com.br/_parametros_para_escrituracao_fiscal_.html?ms=A3ABAAAAAAAAAAAIIBgBCAQ%3D&st=MA%3D%3D&sct=OTc0&mw=MzAw",
        "content": "Define os parâmetros que orientam a escrituração fiscal, garantindo que os registros contábeis estejam de acordo com as normas legais."
      },
      {
        "id": "propostas_investimento",
        "title": "Propostas de Investimento",
        "url": "https://helpsinge.lince.com.br/propostas_de_investimento_.html?ms=A3ABAAAAAAAAAAAIIBgBCAQ%3D&st=MA%3D%3D&sct=OTc0&mw=MzAw",
        "content": "Exibe as propostas de investimento, com informações detalhadas para apoiar a análise de viabilidade e a tomada de decisão em novos projetos."
      },
      {
        "id": "registro_eventos_reinf",
        "title": "Registro de Eventos do REINF",
        "url": "https://helpsinge.lince.com.br/registro_de_eventos_do_reinf.html?ms=A3ABAAAAAAAAAAAIIBgBCAQ%3D&st=MA%3D%3D&sct=OTc0&mw=MzAw",
        "content": "Esta página permite o registro dos eventos do REINF, integrando dados para a conformidade e a auditoria fiscal."
      },
      {
        "id": "pre_requisito_envio_eventos",
        "title": "Pré-requisito para Envio dos Eventos",
        "url": "https://helpsinge.lince.com.br/pre_requisito_para_envio_dos_eventos_.html?ms=A3ABAAAAAAAAAAAIIBgBCEQ%3D&st=MA%3D%3D&sct=OTc0&mw=MzAw",
        "content": "Descreve os pré-requisitos necessários para o envio correto dos eventos, garantindo que todas as informações estejam completas."
      },
      {
        "id": "falhas_transmissao_reinf",
        "title": "Falhas na Transmissão do Arquivo REINF",
        "url": "https://helpsinge.lince.com.br/falhas_na_transmissao_do_arquivo_reinf_.html?ms=A3ABAAAAAAAAAAAIIBgBCEQ%3D&st=MA%3D%3D&sct=OTc0&mw=MzAw",
        "content": "Apresenta possíveis falhas na transmissão dos arquivos REINF e orientações para a resolução de problemas e retentativas."
      },
      {
        "id": "patrimonio",
        "title": "Patrimônio",
        "url": "https://helpsinge.lince.com.br/patrimonio.html?ms=A3ABAAAAAAAAAAAIIBgBCEQ%3D&st=MA%3D%3D&sct=MTU3NA%3D%3D&mw=MzAw",
        "content": "Exibe informações e registros sobre o patrimônio da empresa, permitindo a gestão e a avaliação dos ativos."
      },
      {
        "id": "inventario",
        "title": "Inventário",
        "url": "https://helpsinge.lince.com.br/inventario_.html?ms=A3ADAAAAAAAAAAAIIBgBCEQB&st=MA%3D%3D&sct=MTU3NA%3D%3D&mw=MzAw",
        "content": "Esta página é destinada ao controle do inventário, reunindo dados sobre os ativos e possibilitando a verificação e a conciliação dos registros contábeis."
      },
      {
        "id": "solicita_ficha_coletores",
        "title": "Solicita Ficha para Coletores",
        "url": "https://helpsinge.lince.com.br/solicita_ficha_para_coletores_.html?ms=A3ADAAAAAAAAAAAIIBgBCEQB&st=MA%3D%3D&sct=MTI0OQ%3D%3D&mw=MzAw",
        "content": "Permite a solicitação de fichas para coletores, essenciais para o registro e a coleta de dados contábeis e patrimoniais."
      },
      {
        "id": "movimentacao_bens",
        "title": "Movimentação de Bens",
        "url": "https://helpsinge.lince.com.br/movimentacao_de_bens.html?ms=A3ADAAAAAAAAAAAIIBgBCEQB&st=MA%3D%3D&sct=MTI0OQ%3D%3D&mw=MzAw",
        "content": "Registra a movimentação de bens, permitindo o acompanhamento de transferências, baixas e alterações no patrimônio da empresa."
      },
      {
        "id": "ocorrencia_patrimonio",
        "title": "Ocorrência de Patrimônio",
        "url": "https://helpsinge.lince.com.br/ocorrencia_de_patrimonio_.html?ms=A3ADAAAAAAAAAAAIIBgBCEQB&st=MA%3D%3D&sct=MTI0OQ%3D%3D&mw=MzAw",
        "content": "Documenta ocorrências relacionadas ao patrimônio, registrando eventos que afetam os ativos e facilitando a auditoria interna."
      },
      {
        "id": "lista_acertos_inventario",
        "title": "Lista de Acertos de Inventário",
        "url": "https://helpsinge.lince.com.br/lista_acertos_de_inventario_.html?ms=A3ADAAAAAAAAAAAIIBgBCEQB&st=MA%3D%3D&sct=MTI0OQ%3D%3D&mw=MzAw",
        "content": "Exibe uma lista dos acertos realizados no inventário, permitindo a conciliação e o ajuste dos registros contábeis."
      },
      {
        "id": "relaciona_atividade_contabeis",
        "title": "Relaciona Atividade x Contas Contábeis",
        "url": "https://helpsinge.lince.com.br/relaciona_atividade_x_contas_contabeis_.html?ms=A3ADAAAAAAAAAAAIIBgBCEQB&st=MA%3D%3D&sct=MTI0OQ%3D%3D&mw=MzAw",
        "content": "Permite associar atividades específicas às contas contábeis correspondentes, melhorando a rastreabilidade e a correta alocação de despesas e receitas."
      },
      {
        "id": "sped_ecf",
        "title": "SPED ECF",
        "url": "https://helpsinge.lince.com.br/sped_ecf.html?ms=A3ADAAAAAAAAAAAIIBgBCEQB&st=MA%3D%3D&sct=MTI0OQ%3D%3D&mw=MzAw",
        "content": "Esta página apresenta informações e orientações para a emissão do SPED ECF, contribuindo para a conformidade fiscal e contábil."
      },
      {
        "id": "ajustes_valores_lalur",
        "title": "Ajustes de Valores e Lalur B",
        "url": "https://helpsinge.lince.com.br/ajustes_de_valores_e__lalur_b.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MjA0OQ%3D%3D&mw=MzAw",
        "content": "Descreve os procedimentos para realizar ajustes de valores e elaborar o Lalur B, essenciais para a correta escrituração fiscal."
      },
      {
        "id": "base_calculo_ir_cs_lalur",
        "title": "Base de Cálculo IR, CS e Lalur A",
        "url": "https://helpsinge.lince.com.br/base_de_calculo_ir_cs_e_lalur_a.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Apresenta a metodologia para o cálculo da base do Imposto de Renda, Contribuição Social e Lalur A, fundamentais para o fechamento contábil."
      },
      {
        "id": "cadastro_adicoes_lalur",
        "title": "Cadastro das Adições/Exclusões e Lalur",
        "url": "https://helpsinge.lince.com.br/cadastro_das_adicoes_exclusoes_e_lalur.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Permite o cadastro de adições e exclusões para o Lalur, garantindo que todos os ajustes contábeis sejam devidamente registrados."
      },
      {
        "id": "demonstrativo_ir_csll",
        "title": "Demonstrativo do IR, CSLL e Contribuição",
        "url": "https://helpsinge.lince.com.br/demonstrativo_do_ir_csll_contribuicao.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Exibe um demonstrativo consolidado dos impostos e contribuições, permitindo a análise dos encargos fiscais e a performance financeira."
      },
      {
        "id": "digitacao_valores_conta_lalur",
        "title": "Digitação dos Valores em Conta e Lalur",
        "url": "https://helpsinge.lince.com.br/digitacao_dos_valores_em_conta_e_lalur.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Esta página permite a digitação manual dos valores que serão lançados na conta e no Lalur, facilitando a atualização dos registros contábeis."
      },
      {
        "id": "doacoes_campanhas",
        "title": "Doações em Campanhas Eleitorais",
        "url": "https://helpsinge.lince.com.br/doacoes_em_campanhas_eleitorais.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Apresenta informações sobre doações realizadas em campanhas eleitorais, conforme as regras legais e regulatórias vigentes."
      },
      {
        "id": "identificacao_socio",
        "title": "Identificação Sócio-Proprietário",
        "url": "https://helpsinge.lince.com.br/identificacao_socio_proprietario.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Exibe os dados de identificação dos sócios-proprietários, essenciais para a estrutura societária e a governança da empresa."
      },
      {
        "id": "parametros_sped_ecf",
        "title": "Parâmetros para SPED ECF",
        "url": "https://helpsinge.lince.com.br/parametros_para_sped_ecf.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Define os parâmetros técnicos e operacionais para a emissão do SPED ECF, garantindo a conformidade com as exigências fiscais."
      },
      {
        "id": "participacao_coligadas",
        "title": "Participação em Coligadas/Controladas",
        "url": "https://helpsinge.lince.com.br/participacao_em_coligadas_controladas_.html?ms=A3ADAAAAAAAAAAAIIBgBCEQF&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=MzAw",
        "content": "Apresenta informações sobre a participação da empresa em coligadas e controladas, com dados relevantes para análise de investimentos e estrutura societária."
      },
      {
        "id": "custos_home",
        "title": "Custos",
        "url": "https://helpsinge.lince.com.br/custos.html?ms=AXADAAAAAAAAAAAIGAEIRAU%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Página principal do módulo de Custos, apresentando uma visão geral dos indicadores e processos de gestão de custos da empresa."
      },
      {
        "id": "arquitetura_modulo_11",
        "title": "Arquitetura do Módulo 11",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_11.html?ms=AwAAAAAAAAAAAAAIQA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Detalha a estrutura e os componentes do Módulo 11, que integra os processos de custos e sua interface com outros sistemas da organização."
      },
      {
        "id": "plastico_3_custos",
        "title": "Plástico 3 (Custos)",
        "url": "https://helpsinge.lince.com.br/plastico_3.html?ms=AwACAAAAAAAAAAAIQAg%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Apresenta elementos gráficos e visuais que compõem a interface do módulo de Custos, auxiliando na identificação dos dados contábeis."
      },
      {
        "id": "rotina_custos",
        "title": "Cadastro e Consulta da Rotina de Custos",
        "url": "https://helpsinge.lince.com.br/cadastro_e_consulta_da_rotina_de_custos.html?ms=AwACAABAAAAAAAAIQAgQ&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Interface para cadastro e consulta da rotina de custos, onde são registrados os lançamentos e procedimentos operacionais relacionados aos custos."
      },
      {
        "id": "cir032_custos",
        "title": "CIR032 – Gerar Movimento para Cálculo de Custo",
        "url": "https://helpsinge.lince.com.br/cir032___gerar_movimento_para_calculo_de_custo.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Explica o processo de geração de movimentos contábeis para o cálculo de custos, conforme os critérios definidos na norma CIR032."
      },
      {
        "id": "cir033_custos",
        "title": "CIR033 – Cálculo de Custos",
        "url": "https://helpsinge.lince.com.br/cir033___calculo_de_custos.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Apresenta os métodos e fórmulas utilizados para o cálculo dos custos, com base na norma CIR033, garantindo a precisão dos resultados."
      },
      {
        "id": "cir035_custos",
        "title": "CIR035 – Valorização do Estoque",
        "url": "https://helpsinge.lince.com.br/cir035___valorizacao_do_estoque.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Descreve o processo para a valorização do estoque, fundamental para a mensuração correta dos custos e a avaliação do desempenho financeiro."
      },
      {
        "id": "custo_transporte_revenda",
        "title": "Custo Transporte – Precificação Revenda",
        "url": "https://helpsinge.lince.com.br/custo_transporte_precificacao_revenda.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Fornece informações sobre o custo de transporte aplicado na precificação de revenda, permitindo a análise de margens e a definição de preços."
      },
      {
        "id": "cadastro_contas_bens_custos",
        "title": "Cadastro de Contas e Bens",
        "url": "https://helpsinge.lince.com.br/cadastro_de_contas_e_bens.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=MzAw",
        "content": "Permite o cadastro de contas contábeis e bens relacionados aos custos, integrando informações patrimoniais e operacionais."
      },
      {
        "id": "grafico_rentabilidade",
        "title": "Gráfico de Rentabilidade",
        "url": "https://helpsinge.lince.com.br/grafico_de_rentabilidade_.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=MzAw",
        "content": "Exibe um gráfico que ilustra a rentabilidade da empresa, permitindo a visualização do desempenho financeiro em relação aos custos."
      },
      {
        "id": "produtos_em_elaboracao",
        "title": "Produtos em Elaboração",
        "url": "https://helpsinge.lince.com.br/produtos_em_elaboracao_.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=MzAw",
        "content": "Mostra os produtos que estão em processo de elaboração, vinculando os custos de desenvolvimento e produção com a análise contábil."
      },
      {
        "id": "relacao_conta_centro_custos",
        "title": "Relação Conta x Centro de Custos",
        "url": "https://helpsinge.lince.com.br/relacao_entre_contas_do_p_o.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Ferramenta que relaciona as diferentes contas que compõem o plano operacional, facilitando a análise e o cruzamento de informações contábeis."
      },
      {
        "id": "simulacao_rentabilidade_filial",
        "title": "Simulação de Rentabilidade por Filial",
        "url": "https://helpsinge.lince.com.br/_simulacao_de_rentabilidade_por_filial.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Oferece uma ferramenta de simulação para avaliar a rentabilidade de cada filial, ajudando na tomada de decisões estratégicas."
      },
      {
        "id": "valores_simulacao_precos",
        "title": "Valores para Simulação de Preços",
        "url": "https://helpsinge.lince.com.br/valores_para_simulacao_de_precos.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Exibe os valores utilizados na simulação de preços, permitindo o ajuste das margens e a definição dos preços de venda com base nos custos."
      },
      {
        "id": "valores_para_custos",
        "title": "Valores para Custos",
        "url": "https://helpsinge.lince.com.br/valores_para_custos.html?ms=AwACAABAAEAAAAAIQAgQCA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=MzAw",
        "content": "Fornece os valores base que alimentam os cálculos de custos, essenciais para a elaboração de orçamentos e para o monitoramento financeiro."
      },
      {
        "id": "suprimentos_home",
        "title": "Suprimentos",
        "url": "https://helpsinge.lince.com.br/suprimentos.html?ms=AQACAABAAEAAAAAICBAI&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Página principal do módulo de Suprimentos, que oferece uma visão geral dos processos de aquisição, gestão e distribuição de materiais e insumos."
      },
      {
        "id": "arquitetura_modulo_12_suprimentos",
        "title": "Arquitetura do Módulo 12 (Suprimentos)",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_12.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MjAw&mw=MzAw",
        "content": "Apresenta a estrutura organizacional e os fluxos de informação do módulo de Suprimentos, integrando os processos de compras, estoque e logística."
      },
      {
        "id": "acompanhamento_estoque_vs_consumo",
        "title": "Acompanhamento: Estoque vs Consumo",
        "url": "https://helpsinge.lince.com.br/acompanhamento_estoque_vs__consumo_.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MjAw&mw=MzAw",
        "content": "Ferramenta que compara o estoque disponível com o consumo real, auxiliando no planejamento e na reposição de materiais."
      },
      {
        "id": "acompanhamento_projecao_estoque",
        "title": "Acompanhamento da Projeção de Estoque",
        "url": "https://helpsinge.lince.com.br/acompanhamento_da_projecao_de_estoque.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MjAw&mw=MzAw",
        "content": "Exibe projeções futuras do estoque com base em dados históricos e tendências de consumo, para apoio à tomada de decisão."
      },
      {
        "id": "arquivar_contrato_fornecedor",
        "title": "Arquivar Contrato de Fornecedor",
        "url": "https://helpsinge.lince.com.br/arquivar_contrato_de_fornecedor.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MjAw&mw=MzAw",
        "content": "Interface para arquivamento e consulta dos contratos firmados com fornecedores, facilitando a gestão documental."
      },
      {
        "id": "aprovacao_solicitacoes_compras",
        "title": "Aprovação Eletrônica de Solicitações de Compras",
        "url": "https://helpsinge.lince.com.br/aprovacao_eletronica_de_solicitacoes_de_compras.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MjAw&mw=MzAw",
        "content": "Sistema que automatiza a aprovação de solicitações de compra, tornando o fluxo de aquisição mais ágil e transparente."
      },
      {
        "id": "cadastro_almoxarifados",
        "title": "Cadastro de Almoxarifados",
        "url": "https://helpsinge.lince.com.br/cadastro_de_almoxarifados.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MjAw&mw=MzAw",
        "content": "Página para cadastro e consulta dos almoxarifados, permitindo o gerenciamento eficiente dos estoques e insumos."
      },
      {
        "id": "fichas_inspecao",
        "title": "Cadastro das Fichas de Inspeção",
        "url": "https://helpsinge.lince.com.br/cadastro_das_fichas_de_inspecao.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MjAw&mw=MzAw",
        "content": "Interface para o registro e controle das fichas de inspeção, essenciais para a verificação da qualidade dos materiais."
      },
      {
        "id": "cadastro_solicitantes_compradores_aprovadores",
        "title": "Cadastro de Solicitantes, Compradores e Aprovadores",
        "url": "https://helpsinge.lince.com.br/cadastro_de_solicitantes__compradores_e_aprovadores.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=NTAw&mw=MzAw",
        "content": "Sistema para cadastro dos responsáveis pelos processos de solicitação, compra e aprovação de materiais, organizando as funções internas."
      },
      {
        "id": "cadastro_familias_consumo",
        "title": "Cadastro de Famílias e Contabilização para Consumo",
        "url": "https://helpsinge.lince.com.br/cadastro_de_familias_e_contabilizacao_para_consumo.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=NTAw&mw=MzAw",
        "content": "Ferramenta que permite o cadastro das famílias de produtos e a contabilização dos consumos, auxiliando na gestão orçamentária."
      },
      {
        "id": "materiais_expediente_limpeza",
        "title": "Cadastro de Materiais de Expediente e Limpeza",
        "url": "https://helpsinge.lince.com.br/cadastro_de_materiais_de_expediente_limpeza.html?ms=BQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=NTAw&mw=MzAw",
        "content": "Página destinada ao cadastro dos materiais de expediente e produtos de limpeza, fundamentais para a operação dos escritórios."
      },
      {
        "id": "cotacao_fornecedores",
        "title": "Cotação para Fornecedores",
        "url": "https://helpsinge.lince.com.br/cotacao_para_fornecedores.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=NTAw&mw=MzAw",
        "content": "Sistema de cotações que permite comparar preços e condições oferecidas pelos fornecedores, auxiliando na tomada de decisão."
      },
      {
        "id": "cadastro_consulta_materiais",
        "title": "Cadastro e Consulta de Materiais",
        "url": "https://helpsinge.lince.com.br/cadastro_e_consulta_de_materiais_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=NTAw&mw=MzAw",
        "content": "Interface para o cadastro e consulta dos materiais disponíveis, facilitando o controle e a atualização do inventário."
      },
      {
        "id": "cadastro_consulta_fornecedores",
        "title": "Cadastro e Consulta de Fornecedores",
        "url": "https://helpsinge.lince.com.br/cadastro_e_consulta_de_fornecedores.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=NzAw&mw=MzAw",
        "content": "Permite o cadastro e a consulta dos fornecedores, contribuindo para o gerenciamento das parcerias comerciais."
      },
      {
        "id": "cadastro_tipos_inspecao",
        "title": "Cadastro de Tipos de Inspeção",
        "url": "https://helpsinge.lince.com.br/cadastro_de_tipos_de_inspecao_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=NzAw&mw=MzAw",
        "content": "Página para cadastrar os tipos de inspeção utilizados, padronizando os critérios de avaliação de qualidade dos materiais."
      },
      {
        "id": "compara_consumo_externa",
        "title": "Comparação de Consumo x Produção Externa",
        "url": "https://helpsinge.lince.com.br/compara_consumo_x_producao_externa.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=NzAw&mw=MzAw",
        "content": "Ferramenta que permite comparar o consumo interno com a produção externa, oferecendo insights para ajustes de demanda e oferta."
      },
      {
        "id": "consulta_entradas_material",
        "title": "Consulta de Entradas por Material",
        "url": "https://helpsinge.lince.com.br/consulta_entradas_por_material_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=NzAw&mw=MzAw",
        "content": "Exibe os registros de entradas de materiais, possibilitando o acompanhamento detalhado dos recebimentos."
      },
      {
        "id": "consulta_recebimento_nfs",
        "title": "Consulta de Recebimento de Notas Fiscais",
        "url": "https://helpsinge.lince.com.br/consulta_recebimento_de_notas_fiscais_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=NzAw&mw=MzAw",
        "content": "Interface para consultar o recebimento de notas fiscais, garantindo a rastreabilidade dos documentos fiscais."
      },
      {
        "id": "consulta_requisicao_materiais",
        "title": "Consulta de Requisição de Materiais",
        "url": "https://helpsinge.lince.com.br/consulta_requisicao_de_materiais_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Permite a visualização das requisições de materiais, integrando o processo de solicitação com o controle de estoque."
      },
      {
        "id": "consulta_saldo_almoxarifado",
        "title": "Consulta de Saldo por Almoxarifado",
        "url": "https://helpsinge.lince.com.br/consulta_saldo_por_almoxarifado_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Exibe o saldo atual de materiais em cada almoxarifado, fundamental para o controle de estoque e planejamento de reposição."
      },
      {
        "id": "consulta_saldo_faccao",
        "title": "Consulta de Saldo de Faccao",
        "url": "https://helpsinge.lince.com.br/consulta_saldo_de_faccao.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Interface para verificar o saldo de produção destinado à facção, importante para a análise de desempenho e custos."
      },
      {
        "id": "consulta_xml_sem_entrada",
        "title": "Consulta de XML sem Entrada no Sistema",
        "url": "https://helpsinge.lince.com.br/consulta_xml_sem_entrada_no_sistema_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Ferramenta para identificar arquivos XML que não foram importados para o sistema, facilitando a resolução de inconsistências."
      },
      {
        "id": "consulta_nf_material_faccionista",
        "title": "Consulta de NF – Material x NF Faccionista",
        "url": "https://helpsinge.lince.com.br/consulta_nf_material_x_nf_faccionista.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Permite correlacionar notas fiscais de materiais com as emitidas para facção, garantindo a consistência fiscal dos registros."
      },
      {
        "id": "inspecoes_pendentes",
        "title": "Inspeções Pendentes",
        "url": "https://helpsinge.lince.com.br/__inspecoes_pendentes_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Listagem das inspeções que ainda não foram concluídas, possibilitando a ação imediata para correção de falhas."
      },
      {
        "id": "inventario_suprimentos",
        "title": "Inventário de Materiais",
        "url": "https://helpsinge.lince.com.br/inventario.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Apresenta o inventário atual dos materiais, permitindo o acompanhamento do estoque e a atualização dos registros."
      },
      {
        "id": "manutencao_pedidos_compras",
        "title": "Manutenção de Pedidos de Compras",
        "url": "https://helpsinge.lince.com.br/manutencao_de_pedidos_de_compras.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTQwMA%3D%3D&mw=MzAw",
        "content": "Interface para gerenciar e atualizar os pedidos de compras, corrigindo erros ou duplicidades no sistema."
      },
      {
        "id": "materiais_controle_centro_consumo",
        "title": "Materiais com Controle por Centro de Custo – Consumo",
        "url": "https://helpsinge.lince.com.br/materiais_com_controle_por_centro_de_custo___consumo.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTA2Nw%3D%3D&mw=MzAw",
        "content": "Exibe os materiais organizados por centro de custo, facilitando a análise do consumo e a alocação de despesas."
      },
      {
        "id": "parametrizacao_ficha_inspecao",
        "title": "Parametrização da Ficha de Inspeção",
        "url": "https://helpsinge.lince.com.br/parametrizacao_da_ficha_de_inspecao_.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTA2Nw%3D%3D&mw=MzAw",
        "content": "Página para configurar os critérios e os parâmetros das fichas de inspeção, padronizando a avaliação de qualidade dos materiais."
      },
      {
        "id": "planejamento_necessidades_materiais",
        "title": "Planejamento das Necessidades de Materiais",
        "url": "https://helpsinge.lince.com.br/planejamento_das_necessidades_de_materiais.html?ms=BQAEAAAAAAAAAAAIAUA%3D&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Ferramenta que integra dados de consumo e demanda para o planejamento adequado da reposição e aquisição de materiais."
      },
      {
        "id": "manutencao_exclusao_pedidos_compra",
        "title": "Manutenção/Exclusão dos Pedidos de Compra",
        "url": "https://helpsinge.lince.com.br/manutencao_exclusao_dos_pedidos_de_compra.html?ms=BQAkAAAAAAAAAAAIAUAE&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Interface para gerenciar a exclusão ou manutenção dos pedidos de compra, permitindo ajustes nos registros conforme necessário."
      },
      {
        "id": "pontuacao_qualidade_fornecedor",
        "title": "Pontuação da Qualidade dos Fornecedores",
        "url": "https://helpsinge.lince.com.br/pontuacao_da_qualidade_fornecedor_.html?ms=BQAkAAAAAAAAAAAIAUAE&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Página que apresenta a avaliação dos fornecedores com base em critérios de qualidade, contribuindo para a seleção e melhoria contínua."
      },
      {
        "id": "recebimentos_consulta_nfs",
        "title": "Recebimentos e Consulta de NFS-e",
        "url": "https://helpsinge.lince.com.br/recebimentos_e_consulta_de_nfs_e.html?ms=BQAkAAAAAAAAAAAIAUAE&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Registra e permite a consulta de notas fiscais eletrônicas, facilitando o controle fiscal dos processos de compra."
      },
      {
        "id": "requisicao_materiais",
        "title": "Requisição de Materiais",
        "url": "https://helpsinge.lince.com.br/requisicao_de_materiais_.html?ms=BQAkAAAAAAAAAAAIAUAE&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Interface para a criação e o acompanhamento de requisições de materiais, integrando o fluxo de compras com o controle de estoque."
      },
      {
        "id": "solicitacoes_compra",
        "title": "Solicitações de Compra",
        "url": "https://helpsinge.lince.com.br/solicitacoes_de_compra.html?ms=BQAkAAAAAAAAAAAIAUAE&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Página destinada ao registro e acompanhamento das solicitações de compra realizadas pelos setores da empresa."
      },
      {
        "id": "cadastro_contas_solicitacoes_compra",
        "title": "Cadastro de Contas para Solicitações de Compra",
        "url": "https://helpsinge.lince.com.br/cadastro_das_contas_para_as_solicitacoes_de_compra.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTM2Nw%3D%3D&mw=MzAw",
        "content": "Ferramenta para o cadastro das contas contábeis associadas às solicitações de compra, garantindo a correta alocação dos custos."
      },
      {
        "id": "solicitacao_material_expediente",
        "title": "Solicitação de Material de Expediente",
        "url": "https://helpsinge.lince.com.br/solicitacao_de_material_de_expediente.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTQ0NQ%3D%3D&mw=MzAw",
        "content": "Interface para solicitar materiais de expediente, essenciais para o funcionamento diário dos escritórios."
      },
      {
        "id": "solicitacao_transferencia_almoxarifados",
        "title": "Solicitação de Transferência de Almoxarifados",
        "url": "https://helpsinge.lince.com.br/solicitacao_de_transferencia_de_almoxarifados__.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTQ0NQ%3D%3D&mw=MzAw",
        "content": "Permite solicitar a transferência de materiais entre almoxarifados, contribuindo para uma gestão mais eficiente dos estoques."
      },
      {
        "id": "transferencias_entre_depositos",
        "title": "Transferências entre Depósitos",
        "url": "https://helpsinge.lince.com.br/transferencias_entre_depositos.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTQ0NQ%3D%3D&mw=MzAw",
        "content": "Página para gerenciar a transferência de materiais entre depósitos, facilitando a reorganização dos estoques."
      },
      {
        "id": "recebimento_nota_fiscal",
        "title": "Recebimento de Nota Fiscal",
        "url": "https://helpsinge.lince.com.br/recebimento_de_nota_fiscal_.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTg0NQ%3D%3D&mw=MzAw",
        "content": "Interface para o registro do recebimento de notas fiscais, integrando as informações fiscais ao sistema."
      },
      {
        "id": "recebimento_notas_fiscais",
        "title": "Recebimento de Notas Fiscais",
        "url": "https://helpsinge.lince.com.br/recebimento_de_notas_fiscais.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=MzAw",
        "content": "Consulta e registro das notas fiscais recebidas, essenciais para o controle dos processos de compra e pagamento."
      },
      {
        "id": "recebimento_nota_servico_eletronica",
        "title": "Recebimento de NFS-e (Nota Fiscal de Serviço Eletrônica)",
        "url": "https://helpsinge.lince.com.br/recebimento_de_nota_fiscal_de_servico___eletronica.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=MzAw",
        "content": "Registra o recebimento de notas fiscais de serviço emitidas eletronicamente, para integração fiscal."
      },
      {
        "id": "recebimento_nota_sem_material",
        "title": "Recebimento de Nota Fiscal sem Material",
        "url": "https://helpsinge.lince.com.br/recebimento_de_nota_fiscal___sem_material.html?ms=BQAkAAAAAAAAAAAIAUBE&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=MzAw",
        "content": "Registra notas fiscais que não possuem material associado, possibilitando a verificação de lançamentos atípicos."
      },
      {
        "id": "exclusao_recebimento",
        "title": "Exclusão de Recebimento",
        "url": "https://helpsinge.lince.com.br/exclusao_de_recebimento.html?ms=BQBkAAAAAAAAAAAIAUBEQA%3D%3D&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=MzAw",
        "content": "Ferramenta para exclusão de registros de recebimento, corrigindo erros ou duplicidades no sistema."
      },
      {
        "id": "recebimento_materiais_por_tipo_fornecedor",
        "title": "Recebimento de Materiais por Tipo e Fornecedor",
        "url": "https://helpsinge.lince.com.br/recebimento_de_materiais_por_tipo_e_por_fornecedor.html?ms=BQBkAAAAAAAAAAAIAUBEQA%3D%3D&st=MA%3D%3D&sct=MjEzNg%3D%3D&mw=MzAw",
        "content": "Organiza os recebimentos de materiais de acordo com o tipo e o fornecedor, facilitando o controle e a análise de desempenho."
      },
      {
        "id": "recebimento_documento_sem_efeito_fiscal",
        "title": "Recebimento de Documento sem Efeito Fiscal",
        "url": "https://helpsinge.lince.com.br/recebimento_de_documento_sem_efeito_fiscal.html?ms=BQBkAAAAAAAAAAAIAUBEQA%3D%3D&st=MA%3D%3D&sct=MTQ4NQ%3D%3D&mw=MzAw",
        "content": "Registra documentos que, embora recebidos, não têm impacto fiscal, permitindo o controle destes registros."
      },
      {
        "id": "relatorio_prazo_medio_compras",
        "title": "Relatório – Prazo Médio de Compras",
        "url": "https://helpsinge.lince.com.br/relatorio____prazo_medio_de_compras.html?ms=BQBkAAAAAAAAAAAIAUBEQA%3D%3D&st=MA%3D%3D&sct=MTQ4NQ%3D%3D&mw=MzAw",
        "content": "Relatório que apresenta o prazo médio entre o pedido e o recebimento dos materiais, auxiliando na análise da eficiência do processo de compras."
      },
      {
        "id": "relatorio_movimentacao_materiais",
        "title": "Relatório – Movimentação de Materiais",
        "url": "https://helpsinge.lince.com.br/relatorio___movimentacao_de_materiais_.html?ms=BQBkAAAAAAAAAAAIAUBEQA%3D%3D&st=MA%3D%3D&sct=MTQ4NQ%3D%3D&mw=MzAw",
        "content": "Exibe as movimentações de materiais no sistema, detalhando entradas, saídas e transferências para análise operacional."
      },
      {
        "id": "relatorio_avaliacao_fornecedores",
        "title": "Relatório – Avaliação de Fornecedores",
        "url": "https://helpsinge.lince.com.br/relatorio___avaliacao_de_fornecedores.html?ms=BQBkAAAAAAAAAAAIAUBEQA%3D%3D&st=MA%3D%3D&sct=MTQ4NQ%3D%3D&mw=MzAw",
        "content": "Fornece uma análise comparativa do desempenho dos fornecedores com base em critérios de qualidade, prazo e custo."
      },
      {
        "id": "relatorio_posicao_estoque",
        "title": "Relatório – Posição de Estoque",
        "url": "https://helpsinge.lince.com.br/relatorio___posicao_de_estoque.html?ms=BQBkAAAAAAAAAAAIAUBEQA%3D%3D&st=MA%3D%3D&sct=MTQ4NQ%3D%3D&mw=MzAw",
        "content": "Apresenta um panorama da posição atual dos estoques, permitindo a análise do balanceamento e da disponibilidade de materiais."
      },
      {
        "id": "rh_home",
        "title": "Recursos Humanos",
        "url": "https://helpsinge.lince.com.br/rh.html?ms=AQBkAAAAAAAAAAAIQERA&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Página principal do módulo de Recursos Humanos, que oferece uma visão geral dos processos relacionados à gestão de pessoas, incluindo informações sobre o quadro de funcionários, políticas e ações do RH."
      },
      {
        "id": "arquitetura_modulo_13",
        "title": "Arquitetura do Módulo 13",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_13.html?ms=BQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Detalha a estrutura e os fluxos de informações do módulo de Recursos Humanos, mostrando como os dados se interligam para suportar a gestão de pessoal."
      },
      {
        "id": "administracao_pessoal",
        "title": "Administração de Pessoal",
        "url": "https://helpsinge.lince.com.br/administracao_de_pessoal.html?ms=BQAAAQAAAAAAAAAIAkA%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=MzAw",
        "content": "Interface para a administração de pessoal, onde são gerenciados dados cadastrais, atualizações e informações administrativas dos colaboradores."
      },
      {
        "id": "aprovacao_requisicao",
        "title": "Aprovação de Requisição",
        "url": "https://helpsinge.lince.com.br/aprovacao_de_requisicao.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Sistema para aprovação de requisições internas, facilitando o fluxo de solicitações e a tomada de decisões no RH."
      },
      {
        "id": "consulta_absenteismo_diario",
        "title": "Consulta de Absenteísmo Diário",
        "url": "https://helpsinge.lince.com.br/consulta_absenteismo_diario_.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Relatório que exibe os dados diários de absenteísmo, permitindo identificar e analisar faltas e ausências dos colaboradores."
      },
      {
        "id": "consulta_posto_trabalho",
        "title": "Consulta de Posto de Trabalho",
        "url": "https://helpsinge.lince.com.br/consulta_de_posto_de_trabalho.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Ferramenta para consulta de informações sobre os postos de trabalho, ajudando a identificar a distribuição dos colaboradores e a alocação de recursos."
      },
      {
        "id": "cadastro_cbos",
        "title": "Cadastro de CBOs",
        "url": "https://helpsinge.lince.com.br/cadastro_de_cbos.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Interface para o cadastro dos Códigos Brasileiros de Ocupações (CBOs), fundamental para a classificação das funções dos colaboradores."
      },
      {
        "id": "cadastro_cargos",
        "title": "Cadastro de Cargos",
        "url": "https://helpsinge.lince.com.br/cadastro_de_cargos.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Página destinada ao cadastro dos cargos, permitindo definir funções, hierarquia e responsabilidades dentro da organização."
      },
      {
        "id": "descricao_atividades_cargo",
        "title": "Descrição das Atividades do Cargo",
        "url": "https://helpsinge.lince.com.br/cadastro_da_descricao_das_atividades_do_cargo.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Ferramenta para registrar a descrição detalhada das atividades atribuídas a cada cargo, facilitando a definição de responsabilidades."
      },
      {
        "id": "servico_seguranca_ocupacional",
        "title": "Descrição do Serviço de Segurança Ocupacional",
        "url": "https://helpsinge.lince.com.br/cadastro_descricao_servico_de_seguranca_ocupacional_.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Página para cadastro da descrição dos serviços de segurança ocupacional, essencial para garantir a conformidade e a segurança dos ambientes de trabalho."
      },
      {
        "id": "cadastro_eventos_rh",
        "title": "Cadastro de Eventos",
        "url": "https://helpsinge.lince.com.br/cadastro_de_eventos.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Interface para o cadastro de eventos relacionados ao RH, como treinamentos, workshops e comunicados importantes."
      },
      {
        "id": "consulta_ficha_cargo",
        "title": "Consulta da Ficha de Descrição do Cargo",
        "url": "https://helpsinge.lince.com.br/consulta_ficha_de_descricao_do_cargo.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Ferramenta para consultar as fichas que detalham as descrições dos cargos, permitindo a verificação e o alinhamento das responsabilidades."
      },
      {
        "id": "cadastro_funcionarios",
        "title": "Cadastro de Funcionários",
        "url": "https://helpsinge.lince.com.br/cadastro_de_funcionarios.html?ms=BQAAAQAAAgAAAAAIAkAE&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Interface para cadastro e atualização dos dados dos funcionários, integrando informações pessoais, profissionais e contratuais."
      },
      {
        "id": "relatorio_admissionais",
        "title": "Relatório Admissionais",
        "url": "https://helpsinge.lince.com.br/relatorio_admissionais.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=NDAw&mw=MzAw",
        "content": "Relatório que consolida os dados admissionais dos colaboradores, auxiliando na análise dos processos de contratação e integração."
      },
      {
        "id": "relatorio_movimentacao_pessoal",
        "title": "Relatório de Movimentação de Pessoal",
        "url": "https://helpsinge.lince.com.br/relatorio_lista_movimentacao_de_pessoal.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Apresenta a movimentação dos funcionários, incluindo contratações, demissões e transferências, para análise do fluxo de recursos humanos."
      },
      {
        "id": "cadastro_indicadores_desempenho",
        "title": "Cadastro de Indicadores e Avaliação de Desempenho",
        "url": "https://helpsinge.lince.com.br/cadastro_de_indicadores___avaliacao_de_desempenho.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTEwMA%3D%3D&mw=MzAw",
        "content": "Ferramenta para o cadastro de indicadores que auxiliam na avaliação de desempenho dos colaboradores, contribuindo para o desenvolvimento e a melhoria contínua."
      },
      {
        "id": "cadastro_terceiros",
        "title": "Cadastro de Terceiros",
        "url": "https://helpsinge.lince.com.br/cadastro_de_terceiros.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=ODAw&mw=MzAw",
        "content": "Interface para cadastro de terceiros, como prestadores de serviços e consultores, que interagem com a área de RH."
      },
      {
        "id": "calculo_rescisao",
        "title": "Cálculo de Rescisão",
        "url": "https://helpsinge.lince.com.br/calculo_de_rescisao_.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=ODAw&mw=MzAw",
        "content": "Ferramenta para o cálculo de rescisões contratuais, integrando regras trabalhistas e valores devidos aos colaboradores desligados."
      },
      {
        "id": "consulta_aniversariantes",
        "title": "Consulta de Aniversariantes e Tempo de Empresa",
        "url": "https://helpsinge.lince.com.br/consulta_aniversariante_tempo_de_empresa_.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=ODAw&mw=MzAw",
        "content": "Consulta que identifica os aniversariantes e exibe o tempo de serviço dos funcionários, importante para ações de reconhecimento e benefícios."
      },
      {
        "id": "consulta_espelho_ponto",
        "title": "Consulta do Espelho de Ponto",
        "url": "https://helpsinge.lince.com.br/consulta_espelho_de_ponto_.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=ODAw&mw=MzAw",
        "content": "Interface para visualizar o espelho de ponto dos colaboradores, facilitando o controle de horários e a verificação de inconsistências."
      },
      {
        "id": "consulta_extrato_banco",
        "title": "Consulta de Extrato de Banco de Dados",
        "url": "https://helpsinge.lince.com.br/consulta_extrato_de_banco_de_dados__.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Ferramenta que reúne e exibe o extrato dos dados do RH, permitindo análises históricas e de desempenho."
      },
      {
        "id": "consulta_funcionarios_terceiros",
        "title": "Consulta de Funcionários Terceiros Sintéticos",
        "url": "https://helpsinge.lince.com.br/consulta_de_funcionarios_terceiros_sinteticos_.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Resumo dos funcionários terceirizados, possibilitando comparações e análises junto aos colaboradores efetivos."
      },
      {
        "id": "consulta_funcionarios_rh",
        "title": "Consulta de Funcionários (RH)",
        "url": "https://helpsinge.lince.com.br/consulta_de_funcionarios___rh.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=OTAw&mw=MzAw",
        "content": "Interface para consulta detalhada dos dados dos funcionários cadastrados no sistema, com informações essenciais para a gestão de RH."
      },
      {
        "id": "consulta_funcionarios_gestor",
        "title": "Consulta de Funcionários – Gestor",
        "url": "https://helpsinge.lince.com.br/consulta_funcionarios___gestor.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=MzAw",
        "content": "Ferramenta destinada aos gestores para consulta e análise dos dados dos colaboradores sob sua supervisão."
      },
      {
        "id": "consulta_historico_funcionarios",
        "title": "Consulta de Histórico de Funcionários",
        "url": "https://helpsinge.lince.com.br/consulta_historico_de_funcionarios.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=Mzky",
        "content": "Exibe o histórico completo de alterações e movimentações no cadastro dos funcionários, importante para auditorias e análises históricas."
      },
      {
        "id": "consulta_turnos",
        "title": "Consulta de Turnos de Trabalho",
        "url": "https://helpsinge.lince.com.br/consulta_turnos_de_trabalho.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTAwMA%3D%3D&mw=Mzky",
        "content": "Interface para consulta dos turnos de trabalho dos colaboradores, auxiliando no planejamento e na organização dos horários."
      },
      {
        "id": "consulta_funcionario_estabilidade",
        "title": "Consulta de Funcionário com Estabilidade",
        "url": "https://helpsinge.lince.com.br/consulta_funcionario_com_estabilidade.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Exibe informações sobre funcionários com estabilidade no emprego, úteis para análises de retenção e desenvolvimento de carreira."
      },
      {
        "id": "consulta_marcacoes",
        "title": "Consulta de Marcações",
        "url": "https://helpsinge.lince.com.br/consulta_as_marcacoes_.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Interface para visualizar as marcações de ponto dos colaboradores, permitindo a identificação de eventuais inconsistências."
      },
      {
        "id": "consulta_estatisticas_rh",
        "title": "Consulta de Estatísticas de RH",
        "url": "https://helpsinge.lince.com.br/consulta_estatisticas_de_rh.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Relatório que consolida estatísticas gerais sobre o desempenho, absenteísmo, turnover e outros indicadores do RH."
      },
      {
        "id": "consulta_estatisticas_menores_aprendizes",
        "title": "Consulta de Estatísticas – Menores Aprendizes e Estrangeiros",
        "url": "https://helpsinge.lince.com.br/consulta_estatisticas_menores_aprendizes_e_estrangeiros.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Exibe estatísticas específicas sobre menores aprendizes e funcionários estrangeiros, contribuindo para análises de diversidade e inclusão."
      },
      {
        "id": "consulta_estatisticas_rh_rotatividade",
        "title": "Consulta de Estatísticas – Rotatividade de RH",
        "url": "https://helpsinge.lince.com.br/consulta_estatisticas_de_rh___rotatividade.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Apresenta dados sobre a rotatividade dos colaboradores, permitindo a análise do turnover e a identificação de possíveis causas."
      },
      {
        "id": "consulta_estatisticas_rh_absenteismo",
        "title": "Consulta de Estatísticas – Absenteísmo e Setores",
        "url": "https://helpsinge.lince.com.br/consulta_estatisticas_de_rh___absenteismo___plasticos_.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Fornece dados sobre absenteísmo, com foco em análises setoriais, permitindo identificar áreas com maior incidência de faltas."
      },
      {
        "id": "contratacao_funcionarios",
        "title": "Contratação de Funcionários",
        "url": "https://helpsinge.lince.com.br/contratacao_de_funcionarios_.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Interface para o gerenciamento do processo de contratação, com informações sobre admissões, integrações e processos seletivos."
      },
      {
        "id": "controle_de_ponto",
        "title": "Controle de Ponto",
        "url": "https://helpsinge.lince.com.br/controle_de_ponto.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Ferramenta para registro e controle de ponto, permitindo a verificação dos horários trabalhados e a gestão dos turnos."
      },
      {
        "id": "digitacao_periodo_aquisitivo",
        "title": "Digitação do Período Aquisitivo",
        "url": "https://helpsinge.lince.com.br/digitacao_do_periodo_aquisitivo.html?ms=BQAAAQAAAgACAAAIAkAEAQ%3D%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Interface para a digitação e o registro do período aquisitivo de férias, integrando as informações dos colaboradores ao sistema de RH."
      },
      {
        "id": "relatorio_provisoes",
        "title": "Relatório de Provisões",
        "url": "https://helpsinge.lince.com.br/relatorio_de_provisoes.html?ms=BQAAAQAAAgAKAAAIAkAEAUA%3D&st=MA%3D%3D&sct=MTMwMA%3D%3D&mw=Mzky",
        "content": "Relatório que consolida as provisões referentes a encargos e benefícios, auxiliando na gestão financeira do RH."
      },
      {
        "id": "eventos_folha_estagiarios",
        "title": "Eventos para Folha de Estagiários",
        "url": "https://helpsinge.lince.com.br/eventos_para_folha_estagiarios_.html?ms=BQAAAQAAAgAKAAAIAkAEAUA%3D&st=MA%3D%3D&sct=MjAwMA%3D%3D&mw=Mzky",
        "content": "Exibe os eventos relacionados à folha de pagamento de estagiários, auxiliando na administração dos encargos e benefícios específicos."
      },
      {
        "id": "fechamento_folha",
        "title": "Fechamento da Folha de Pagamento",
        "url": "https://helpsinge.lince.com.br/fechamento_da_folha_.html?ms=BQAAAQAAAgAKAAAIAkAEAUA%3D&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=Mzky",
        "content": "Processo de fechamento da folha de pagamento, reunindo e consolidando dados para a execução dos pagamentos aos colaboradores."
      },
      {
        "id": "folha_de_pagamento",
        "title": "Folha de Pagamento",
        "url": "https://helpsinge.lince.com.br/folha_de_pagamento.html?ms=BQAAAQAAAgAKAAAIAkAEAUA%3D&st=MA%3D%3D&sct=MTYwMw%3D%3D&mw=Mzky",
        "content": "Interface que apresenta a folha de pagamento, com detalhes sobre salários, descontos, benefícios e encargos dos funcionários."
      },
      {
        "id": "relatorio_movimentacao_dependentes",
        "title": "Relatório de Movimentação de Dependentes",
        "url": "https://helpsinge.lince.com.br/relatorio_movimentacao_de_dependentes.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MTcwMw%3D%3D&mw=Mzky",
        "content": "Relatório que detalha a movimentação e as alterações nos registros dos dependentes dos funcionários, importante para o controle de benefícios."
      },
      {
        "id": "relatorio_afastamentos_retorno",
        "title": "Relatório de Afastamentos e Retornos",
        "url": "https://helpsinge.lince.com.br/relatorio_afastamentos_e_retornos_no_mes.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Apresenta os dados referentes aos afastamentos e retornos dos colaboradores durante o mês, facilitando a análise da assiduidade."
      },
      {
        "id": "relatorio_calculo_folha",
        "title": "Relatório de Cálculo de Folha de Pagamento",
        "url": "https://helpsinge.lince.com.br/relatorio_calculo_de_folha_de_pagamento_.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Exibe os cálculos detalhados da folha de pagamento, incluindo salários, encargos, descontos e totais, para conferência e auditoria."
      },
      {
        "id": "relatorio_resumo_folha",
        "title": "Relatório Resumo da Folha de Pagamento",
        "url": "https://helpsinge.lince.com.br/relatorio_resumo_da_folha_de_pagamento.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Oferece um resumo consolidado da folha de pagamento, permitindo uma visão geral dos custos e dos encargos trabalhistas."
      },
      {
        "id": "relatorio_contribuicao_sindical",
        "title": "Relatório de Contribuição Sindical",
        "url": "https://helpsinge.lince.com.br/relatorio_de_contribuicao_sindical_do_mes.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Apresenta as contribuições sindicais efetuadas no mês, com informações detalhadas para controle e análise dos encargos sindicais."
      },
      {
        "id": "relatorio_imposto_renda_retido",
        "title": "Relatório de Imposto de Renda Retido",
        "url": "https://helpsinge.lince.com.br/relatorio_imposto_de_renda_retido.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Exibe os valores de imposto de renda retido na fonte, essenciais para a conformidade fiscal e a gestão de obrigações tributárias."
      },
      {
        "id": "relatorio_guia_inss",
        "title": "Relatório Guia do INSS",
        "url": "https://helpsinge.lince.com.br/relatorio_guia_do_inss_contabilizacao.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Fornece informações detalhadas para a elaboração do guia do INSS, integrando os dados para a contabilização e recolhimento das contribuições."
      },
      {
        "id": "relatorio_credito_bancario",
        "title": "Relatório de Crédito Bancário",
        "url": "https://helpsinge.lince.com.br/relatorio_de_credito_bancario_.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Exibe os dados relacionados ao crédito bancário, auxiliando na análise das operações financeiras e na verificação dos saldos disponíveis."
      },
      {
        "id": "relatorio_seguro_vida",
        "title": "Relatório de Seguro de Vida em Grupo",
        "url": "https://helpsinge.lince.com.br/relatorio_seguro_de_vida_em_grupo.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Apresenta informações sobre os seguros de vida em grupo oferecidos, essenciais para a gestão de benefícios e a proteção dos colaboradores."
      },
      {
        "id": "relatorio_sefip",
        "title": "Relatório SEFIP, Guia FGTS e INSS",
        "url": "https://helpsinge.lince.com.br/releatorio_sefip___guia_fgts_e_inss.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Consolida as informações necessárias para a geração do relatório SEFIP, integrando os dados do FGTS e do INSS para a conformidade fiscal."
      },
      {
        "id": "relatorio_resumo_geral_folha",
        "title": "Relatório Resumo Geral da Folha de Pagamentos",
        "url": "https://helpsinge.lince.com.br/relatorio_resumo_geral_da_folha_de_pagamentos.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Oferece um panorama geral da folha de pagamentos, reunindo informações essenciais sobre salários, encargos e benefícios."
      },
      {
        "id": "relatorio_atualizacao_estatisticas_rh",
        "title": "Relatório de Atualização das Estatísticas de RH",
        "url": "https://helpsinge.lince.com.br/relatorio_atualizacao_das_estatisticas_do_rh.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjMwMw%3D%3D&mw=Mzky",
        "content": "Atualiza e consolida as estatísticas de RH, permitindo análises contínuas dos indicadores de desempenho e dinâmica do quadro de colaboradores."
      },
      {
        "id": "relatorio_atualizacao_folha",
        "title": "Relatório de Atualização da Folha de Pagamentos",
        "url": "https://helpsinge.lince.com.br/relatorio_atualizacao_da_folha_de_pagamamentos.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjYwMw%3D%3D&mw=Mzky",
        "content": "Fornece dados atualizados da folha de pagamentos, evidenciando variações e permitindo ajustes na gestão financeira dos custos de pessoal."
      },
      {
        "id": "funcionarios_alocados",
        "title": "Funcionários Alocados",
        "url": "https://helpsinge.lince.com.br/funcionarios_alocados_.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjYwMw%3D%3D&mw=Mzky",
        "content": "Exibe a distribuição dos funcionários por departamentos ou setores, facilitando a gestão da alocação de recursos humanos."
      },
      {
        "id": "funcionarios_sinteticos_dependentes",
        "title": "Funcionários – Sintéticos e Dependentes",
        "url": "https://helpsinge.lince.com.br/funcionarios__funcionarios_sinteticos_e_dependentes_dos_funcionarios.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Apresenta um resumo dos dados dos funcionários, incluindo informações sobre dependentes, para facilitar análises de benefícios e encargos."
      },
      {
        "id": "geracao_documentos_contratuais",
        "title": "Geração de Documentos Contratuais",
        "url": "https://helpsinge.lince.com.br/geracao_de_documentos_contratuais_.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Ferramenta que automatiza a criação de documentos contratuais e administrativos, facilitando a formalização de acordos e processos internos."
      },
      {
        "id": "manutencao_eventos_futuros",
        "title": "Manutenção de Eventos Futuros",
        "url": "https://helpsinge.lince.com.br/manutencao_de_eventos_futuros.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Interface para a gestão e atualização de eventos futuros no RH, permitindo o planejamento e acompanhamento de atividades programadas."
      },
      {
        "id": "movimentacao_pessoal",
        "title": "Movimentação de Pessoal",
        "url": "https://helpsinge.lince.com.br/movimentacao_de_pessoal__.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Registro e acompanhamento das movimentações dos colaboradores, incluindo transferências, promoções e alterações contratuais."
      },
      {
        "id": "ocorrencias_marcacoes_gestor",
        "title": "Ocorrências nas Marcações (Gestor)",
        "url": "https://helpsinge.lince.com.br/ocorrencias_nas_marcacoes___gestor_.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Ferramenta para que gestores verifiquem e analisem ocorrências nas marcações de ponto, identificando inconsistências e propondo correções."
      },
      {
        "id": "parametrizacao_desconto_pensao",
        "title": "Parametrização de Desconto de Pensão Alimentícia",
        "url": "https://helpsinge.lince.com.br/parametrizacao_desconto_pensao_alimenticia_.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Interface para configurar os descontos de pensão alimentícia aplicados na folha de pagamento, garantindo precisão no desconto e conformidade legal."
      },
      {
        "id": "parametros_planos_saude",
        "title": "Parâmetros dos Planos de Saúde",
        "url": "https://helpsinge.lince.com.br/parametros_dos_planos_de_saude_.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Página que define os parâmetros e regras para a gestão dos planos de saúde oferecidos aos colaboradores, integrando custos e benefícios."
      },
      {
        "id": "programacao_ferias",
        "title": "Programação de Férias",
        "url": "https://helpsinge.lince.com.br/programacao_de_ferias.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Ferramenta para agendamento e controle dos períodos de férias dos funcionários, facilitando o planejamento e a organização do descanso anual."
      },
      {
        "id": "remessa_pagamento_banco",
        "title": "Remessa de Pagamento – Banco",
        "url": "https://helpsinge.lince.com.br/remessa_pagamento_banco.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Interface que consolida os dados da folha de pagamento para a remessa dos pagamentos ao banco, integrando informações financeiras para o processamento."
      },
      {
        "id": "gestao_talentos",
        "title": "Gestão de Talentos",
        "url": "https://helpsinge.lince.com.br/gestao_de_talentos.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjExNA%3D%3D&mw=Mzky",
        "content": "Página dedicada à gestão de talentos, com foco na identificação, desenvolvimento e retenção dos colaboradores com alto desempenho."
      },
      {
        "id": "sesmt",
        "title": "SESMT",
        "url": "https://helpsinge.lince.com.br/sesmt.html?ms=BQAAAQAAAgAaAAAIAkAEAUAE&st=MA%3D%3D&sct=MjkyNQ%3D%3D&mw=Mzky",
        "content": "Página do Serviço Especializado em Segurança e Medicina do Trabalho (SESMT), com informações, relatórios e ferramentas para a gestão da saúde ocupacional."
      },
      {
        "id": "agendamento_vacinas",
        "title": "Agendamento e Confirmação de Vacinas",
        "url": "https://helpsinge.lince.com.br/agendamento_e_confirmacao_de_vacinas_.html?ms=BQAAAQAAAgAaAAAIAkAUAUAE&st=MA%3D%3D&sct=MzMyNQ%3D%3D&mw=Mzky",
        "content": "Interface para agendar e confirmar a vacinação dos colaboradores, contribuindo para as ações de prevenção e saúde no ambiente de trabalho."
      },
      {
        "id": "cadastro_laudos_epis",
        "title": "Cadastro de Laudos e EPIs",
        "url": "https://helpsinge.lince.com.br/cadastro_de_laudos_e_epis_.html?ms=BQAAAQAAAgAaAAAIAkAUAUAE&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Ferramenta para cadastro de laudos e de Equipamentos de Proteção Individual (EPIs), fundamentais para a segurança e a saúde dos colaboradores."
      },
      {
        "id": "cadastro_vinculo_capacitacao",
        "title": "Cadastro de Vínculo de Capacitação",
        "url": "https://helpsinge.lince.com.br/cadastro_de_vinculo_de_capacitacao_ao_funcionario__.html?ms=BQAAAQAAAgAaAAAIAkAUAUAE&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Página para registrar o vínculo de capacitação e treinamentos oferecidos aos funcionários, apoiando o desenvolvimento profissional."
      },
      {
        "id": "cadastro_periodicidade_exames",
        "title": "Cadastro de Periodicidade de Exames Médicos",
        "url": "https://helpsinge.lince.com.br/cadastro_de_periodicidade_de_exames_medicos_.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Ferramenta para cadastrar a periodicidade dos exames médicos, integrando informações de saúde dos colaboradores para o monitoramento regular."
      },
      {
        "id": "cadastro_posto_trabalho",
        "title": "Cadastro de Posto de Trabalho",
        "url": "https://helpsinge.lince.com.br/cadastro_de_posto_de_trabalho_.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Interface para o cadastro dos postos de trabalho, definindo as funções e os ambientes de trabalho para melhor gestão interna."
      },
      {
        "id": "cadastro_consulta_saidas",
        "title": "Cadastro e Consulta de Saídas",
        "url": "https://helpsinge.lince.com.br/cadastro_e_consulta_de_saidas.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Página que permite o registro e a consulta de saídas de funcionários, essenciais para o controle das movimentações de pessoal."
      },
      {
        "id": "consulta_estatisticas_ambulatoriais",
        "title": "Consulta de Estatísticas Ambulatoriais",
        "url": "https://helpsinge.lince.com.br/consulta_as_estatisticas_ambulatoriais_.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Relatório com estatísticas ambulatoriais relacionadas à saúde dos colaboradores, utilizado para monitorar atendimentos e indicadores de saúde."
      },
      {
        "id": "consulta_historico_seguranca",
        "title": "Consulta de Histórico de Serviço de Segurança Ocupacional",
        "url": "https://helpsinge.lince.com.br/consulta_historico_servico_seguranca_ocupacional_.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Exibe o histórico dos serviços de segurança ocupacional realizados, permitindo a análise de performance e conformidade."
      },
      {
        "id": "consulta_impressao_ppp",
        "title": "Consulta e Impressão de PPP",
        "url": "https://helpsinge.lince.com.br/consulta_e_impressao_de_ppp.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Interface para consulta e impressão do Perfil Profissiográfico Previdenciário (PPP), documento importante para a segurança do trabalho."
      },
      {
        "id": "prontuario_medico",
        "title": "Prontuário Médico",
        "url": "https://helpsinge.lince.com.br/prontuario_medico.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Página que reúne informações médicas dos colaboradores, permitindo o acompanhamento e a gestão dos registros de saúde."
      },
      {
        "id": "consulta_requisicao_epi",
        "title": "Consulta e Impressão de Requisição de EPI",
        "url": "https://helpsinge.lince.com.br/requisicao_e_consulta_de_epi.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Ferramenta para consulta e impressão das requisições de Equipamentos de Proteção Individual (EPIs), fundamentais para a segurança dos colaboradores."
      },
      {
        "id": "servico_seguranca_ocupacional_rh",
        "title": "Serviço de Segurança Ocupacional",
        "url": "https://helpsinge.lince.com.br/servico_de_seguranca_ocupacional_.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Página dedicada à gestão dos serviços de segurança ocupacional, com informações sobre procedimentos, laudos e treinamentos em segurança."
      },
      {
        "id": "e_social_rh",
        "title": "eSocial – Recursos Humanos",
        "url": "https://helpsinge.lince.com.br/e_social.html?ms=BQAAAQAAAgBaAAAIAkAUAUAEAg%3D%3D&st=MA%3D%3D&sct=MjU0Ng%3D%3D&mw=Mzky",
        "content": "Interface do eSocial para o departamento de RH, integrando os dados trabalhistas aos sistemas governamentais para conformidade legal."
      },
      {
        "id": "eventos_e_social_rh",
        "title": "Eventos do eSocial",
        "url": "https://helpsinge.lince.com.br/eventos_do_e_social_.html?ms=BQAAAQAAAgBaAAAIAkA0AUAEAg%3D%3D&st=MA%3D%3D&sct=MzUxNg%3D%3D&mw=Mzky",
        "content": "Exibe os eventos enviados ao eSocial, permitindo o acompanhamento das informações trabalhistas e fiscais reportadas ao governo."
      },
      {
        "id": "internacionalizacao_home",
        "title": "Internacionalização",
        "url": "https://helpsinge.lince.com.br/internacionalizacao.html?ms=AQAAAQAAAgBaAAAIQDQBQAQC&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página principal de Internacionalização, que apresenta a visão geral sobre como o sistema se adapta e opera em mercados internacionais, com foco em traduções, customizações e estratégias globais."
      },
      {
        "id": "arquitetura_modulo_14",
        "title": "Arquitetura do Módulo 14",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_14.html?ms=BQAAAAAAAAAAAAAIBA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Detalha a estrutura e os fluxos do Módulo 14, voltado para os aspectos de internacionalização, com informações sobre integrações e configurações específicas para operações globais."
      },
      {
        "id": "importacao",
        "title": "Importação",
        "url": "https://helpsinge.lince.com.br/importacao.html?ms=BQAAAgAAAAAAAAAIBAE%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página dedicada ao processo de importação, abordando os procedimentos, regras e integrações necessárias para trazer dados e produtos de mercados estrangeiros."
      },
      {
        "id": "arquitetura_modulo_15",
        "title": "Arquitetura do Módulo 15",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_15.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=NTAw&mw=Mzky",
        "content": "Apresenta a arquitetura do Módulo 15, que trata dos processos de internacionalização, destacando a estrutura, os fluxos e as adaptações para operações internacionais."
      },
      {
        "id": "consulta_performance_transportes",
        "title": "Consulta de Performance de Transportes",
        "url": "https://helpsinge.lince.com.br/consulta_de_performance_de_transportes_.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=NTAw&mw=Mzky",
        "content": "Ferramenta que avalia a performance dos transportes internacionais, permitindo a análise de prazos, custos e eficiência no envio de produtos para o exterior."
      },
      {
        "id": "controle_pagamento_importacao",
        "title": "Controle de Pagamento de Importação",
        "url": "https://helpsinge.lince.com.br/controle_de_pagamento_de_importacao_.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Sistema que gerencia os pagamentos relacionados às operações de importação, garantindo a integração dos processos financeiros com o sistema."
      },
      {
        "id": "controle_chegada_materiais",
        "title": "Controle e Acompanhamento da Chegada de Materiais de Importação",
        "url": "https://helpsinge.lince.com.br/controle_e_acompanhamento_da_chegada_de_materiais_de_importacao__.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Ferramenta para monitorar a chegada de materiais importados, verificando prazos, condições de transporte e conformidade com os padrões internacionais."
      },
      {
        "id": "controle_importacao",
        "title": "Controle de Importação",
        "url": "https://helpsinge.lince.com.br/controle_de_importacao.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Página que centraliza o gerenciamento do processo de importação, oferecendo visão geral dos status e atualizações dos pedidos e operações aduaneiras."
      },
      {
        "id": "cadastro_lancamento_produtos",
        "title": "Cadastro de Lançamento de Produtos",
        "url": "https://helpsinge.lince.com.br/cadastro_de_lancamento_de_produtos.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Interface para o registro dos lançamentos de produtos importados, integrando informações essenciais para o controle de estoque e a gestão comercial."
      },
      {
        "id": "consulta_saldo_proformas",
        "title": "Consulta de Saldo de Proformas",
        "url": "https://helpsinge.lince.com.br/consulta_saldo_proformas__.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Ferramenta que permite a consulta de saldos pro forma, auxiliando na análise das projeções financeiras e na previsão de custos das operações de importação."
      },
      {
        "id": "estatistica_preco_produto",
        "title": "Estatística de Preço do Produto",
        "url": "https://helpsinge.lince.com.br/estatistica_de_preco_do_produto.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Página que apresenta análises e estatísticas dos preços dos produtos importados, auxiliando na definição de estratégias de precificação para o mercado internacional."
      },
      {
        "id": "manutencao_lote_minimo",
        "title": "Manutenção de Lote Mínimo",
        "url": "https://helpsinge.lince.com.br/manutencao_de_lote_minimo.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Ferramenta que permite a gestão dos lotes mínimos de importação, assegurando que os níveis de estoque sejam mantidos de forma eficiente e estratégica."
      },
      {
        "id": "ocorrencias_importacao",
        "title": "Ocorrências Financeiras de Importação",
        "url": "https://helpsinge.lince.com.br/ocorrencias_financeiras_de_importacao.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Página destinada ao registro e acompanhamento de ocorrências financeiras nas operações de importação, facilitando a identificação de problemas e a implementação de soluções."
      },
      {
        "id": "pedido_importacao",
        "title": "Pedido de Importação – Peças e Equipamentos",
        "url": "https://helpsinge.lince.com.br/pedido_de_importacao___pecas_e_equipamentos_.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Interface para realizar pedidos de importação de peças e equipamentos, integrando o fluxo de compras e a logística internacional."
      },
      {
        "id": "pedido_compra_importacao",
        "title": "Pedido de Compra – Importação",
        "url": "https://helpsinge.lince.com.br/pedido_de_compra___importacao_.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Página que formaliza os pedidos de compra relacionados a operações de importação, assegurando o controle e a transparência dos processos de aquisição."
      },
      {
        "id": "solicitacoes_courier",
        "title": "Solicitações de Courier",
        "url": "https://helpsinge.lince.com.br/solicitacoes_de_courier_.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Sistema para gerenciar as solicitações de serviços de courier, essenciais para o transporte internacional de produtos e documentos."
      },
      {
        "id": "exportacao",
        "title": "Exportação",
        "url": "https://helpsinge.lince.com.br/exportacao.html?ms=BQAAAgAAAgAAAAAIBAFA&st=MA%3D%3D&sct=MjI3&mw=Mzky",
        "content": "Página que trata dos processos de exportação, abordando os requisitos, documentações e procedimentos necessários para enviar produtos ao exterior."
      },
      {
        "id": "arquitetura_modulo_16",
        "title": "Arquitetura do Módulo 16",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_16.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=MTA1OA%3D%3D&mw=Mzky",
        "content": "Detalha a arquitetura do Módulo 16, que integra funcionalidades de importação e exportação, com foco na adaptação para operações internacionais."
      },
      {
        "id": "atualizacao_status_fatura",
        "title": "Atualização de Status de Fatura",
        "url": "https://helpsinge.lince.com.br/atualizacao_de_status_de_fatura_.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=MTA1OA%3D%3D&mw=Mzky",
        "content": "Interface para atualização do status das faturas das operações internacionais, garantindo a correta gestão financeira e o acompanhamento dos pagamentos."
      },
      {
        "id": "cadastro_cores_cliente",
        "title": "Cadastro de Cores do Cliente",
        "url": "https://helpsinge.lince.com.br/cadastro_de_cores_do_cliente_.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Página para a personalização do sistema por meio do cadastro de cores, permitindo a adaptação da interface para diferentes identidades visuais em contextos internacionais."
      },
      {
        "id": "certificado_origem_ddp",
        "title": "Certificado de Origem / DDP",
        "url": "https://helpsinge.lince.com.br/cerificado_de_origem___ddp.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Documento que comprova a origem dos produtos e define as condições de entrega (Delivered Duty Paid – DDP), essencial para o comércio exterior."
      },
      {
        "id": "consulta_estatistica_separacao_exportacao",
        "title": "Consulta de Estatística de Separação de Pedidos de Exportação",
        "url": "https://helpsinge.lince.com.br/consulta_estatistica_de_separacao_de_pedidos_de_exportacao_.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Ferramenta que apresenta estatísticas referentes à separação de pedidos destinados à exportação, permitindo o monitoramento da eficiência operacional."
      },
      {
        "id": "consulta_pedidos_exportacao",
        "title": "Consulta de Pedidos de Exportação",
        "url": "https://helpsinge.lince.com.br/consulta_pedidos_de_exportacao.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Página para a consulta detalhada dos pedidos de exportação, com dados sobre status, prazos e informações financeiras dos processos."
      },
      {
        "id": "consulta_pedidos_pendentes_setor",
        "title": "Consulta de Pedidos Pendentes por Setor",
        "url": "https://helpsinge.lince.com.br/consulta_pedidos_pendentes_por_setor.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Interface que organiza os pedidos de exportação pendentes por setor, facilitando o gerenciamento e a priorização das atividades pelos gestores."
      },
      {
        "id": "curva_abc_produto",
        "title": "Curva ABC por Produto",
        "url": "https://helpsinge.lince.com.br/curva_abc_por_produto_.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Ferramenta que classifica os produtos exportados em categorias A, B e C com base em seu valor e demanda, auxiliando na gestão estratégica de estoque."
      },
      {
        "id": "digitacao_pedidos_exportacao",
        "title": "Digitação de Pedidos de Exportação",
        "url": "https://helpsinge.lince.com.br/digitacao_de_pedidos_de_exportacao_.html?ms=BQAAAgAABgAAAAAIBAFAAQ%3D%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Interface para a entrada manual dos pedidos de exportação, registrando informações que serão utilizadas para o processamento e faturamento das operações."
      },
      {
        "id": "relacao_produtos_mercado_interno",
        "title": "Relação de Produtos – Outros Mercados e Mercado Interno",
        "url": "https://helpsinge.lince.com.br/relacao_de_produtos_outros_mercados_mercado_interno_.html?ms=BQAAAgAABgAACAAIBAFAARA%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Página que compara produtos destinados ao mercado interno com aqueles para exportação, oferecendo insights estratégicos para a diversificação e posicionamento no mercado global."
      },
      {
        "id": "emissao_invoice",
        "title": "Emissão de Invoice",
        "url": "https://helpsinge.lince.com.br/emissao_da_invoice.html?ms=BQAAAgAABgAACAAIBAFAARA%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Ferramenta para a emissão de invoice, documento fiscal essencial que detalha os produtos, valores e condições de venda para operações internacionais."
      },
      {
        "id": "expedicao_pedidos_exportacao",
        "title": "Expedição de Pedidos de Exportação",
        "url": "https://helpsinge.lince.com.br/expedicao_de_pedidos_de_exportacao.html?ms=BQAAAgAABgAACAAIBAFAARA%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Página que organiza o processo de expedição dos pedidos de exportação, garantindo que os produtos sejam enviados com conformidade aos requisitos logísticos internacionais."
      },
      {
        "id": "reemissao_resumos_embarque",
        "title": "Reemissão de Resumos para Embarque",
        "url": "https://helpsinge.lince.com.br/reemissao_dos_resumos_para_embarque_.html?ms=BQAAAgAABgAACAAIBAFAAVA%3D&st=MA%3D%3D&sct=ODk1&mw=Mzky",
        "content": "Ferramenta para reemissão dos resumos de embarque, consolidando informações essenciais para o acompanhamento e a autorização dos processos de embarque internacional."
      },
      {
        "id": "faturamento_amostras_exportacao",
        "title": "Faturamento de Amostras de Exportação",
        "url": "https://helpsinge.lince.com.br/faturamento_de_amostras_de_exportacao_.html?ms=BQAAAgAABgAACAAIBAFAAVA%3D&st=MA%3D%3D&sct=MTQ5NA%3D%3D&mw=Mzky",
        "content": "Página que apresenta os detalhes de faturamento específicos para amostras de exportação, evidenciando custos e procedimentos exclusivos deste tipo de transação."
      },
      {
        "id": "faturamento_pedidos_exportacao_1",
        "title": "Faturamento de Pedidos de Exportação 1",
        "url": "https://helpsinge.lince.com.br/faturamento_de_pedidos_de_exportacao_1.html?ms=BQAAAgAABgAACAAIBAFAAVA%3D&st=MA%3D%3D&sct=OTc0&mw=Mzky",
        "content": "Interface que consolida os dados de faturamento para os pedidos de exportação na primeira fase, integrando informações financeiras e operacionais."
      },
      {
        "id": "instrucao_embarque",
        "title": "Instrução de Embarque",
        "url": "https://helpsinge.lince.com.br/instrucao_de_embarque_.html?ms=BQAAAgAABgAACAAIBAFAAVA%3D&st=MA%3D%3D&sct=OTc0&mw=Mzky",
        "content": "Página que fornece as instruções detalhadas para o processo de embarque dos produtos, incluindo requisitos, procedimentos e orientações para a exportação."
      },
      {
        "id": "registro_despesas_exportacao",
        "title": "Registro de Despesas de Exportação",
        "url": "https://helpsinge.lince.com.br/registro_de_despesas_alfandegarias.html?ms=BQAAAgAABgAACAAIBAFAAVA%3D&st=MA%3D%3D&sct=OTc0&mw=Mzky",
        "content": "Ferramenta para registrar as despesas alfandegárias e outras despesas relacionadas à exportação, auxiliando na gestão e auditoria dos custos operacionais."
      },
      {
        "id": "registro_pagamento_exportacao",
        "title": "Registro de Pagamento de Fatura de Exportação",
        "url": "https://helpsinge.lince.com.br/registro_de_pagamento_fatura_de_exportacao_.html?ms=BQAAAgAABgAACAAIBAFAAVA%3D&st=MA%3D%3D&sct=OTc0&mw=Mzky",
        "content": "Página que consolida os registros de pagamento das faturas de exportação, garantindo a integração dos dados financeiros para o controle das transações internacionais."
      },
      {
        "id": "plastico_4_exportacao",
        "title": "Plástico 4",
        "url": "https://helpsinge.lince.com.br/plastico_4.html?ms=BQAAAgAABgAACAAIBAFAAVA%3D&st=MA%3D%3D&sct=OTc0&mw=Mzky",
        "content": "Página que apresenta informações sobre o módulo ou funcionalidade denominada 'Plástico 4', possivelmente relacionada a parâmetros ou processos específicos da exportação."
      },
      {
        "id": "entrada_pedidos_exportacao",
        "title": "Entrada de Pedidos de Exportação",
        "url": "https://helpsinge.lince.com.br/entrada_de_pedidos_exportacao.html?ms=BQAAAgAABgAAGAAIBAFAAVAg&st=MA%3D%3D&sct=MTc0MQ%3D%3D&mw=Mzky",
        "content": "Interface para o registro inicial dos pedidos de exportação, permitindo o controle e a validação dos dados de transações internacionais."
      },
      {
        "id": "faturamento_pedidos_exportacao_2",
        "title": "Faturamento de Pedidos de Exportação 2",
        "url": "https://helpsinge.lince.com.br/faturamento_de_pedidos_de_exportacao_2.html?ms=BQAAAgAABgAAGAAIBAFAAVAg&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=Mzky",
        "content": "Página que apresenta os dados de faturamento referentes à segunda fase dos pedidos de exportação, integrando informações financeiras complementares."
      },
      {
        "id": "kanban_supervisor_exportacao",
        "title": "Kanban Supervisor",
        "url": "https://helpsinge.lince.com.br/kanban_supervisor_.html?ms=BQAAAgAABgAAGAAIBAFAAVAg&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=Mzky",
        "content": "Sistema Kanban voltado para supervisores, que permite acompanhar o fluxo de pedidos de exportação em tempo real e facilitar a tomada de decisão."
      },
      {
        "id": "pedidos_exportacao_separado",
        "title": "Pedidos de Exportação – Separado/Faturado",
        "url": "https://helpsinge.lince.com.br/pedidos_exportacao_100__separado_faturado.html?ms=BQAAAgAABgAAGAAIBAFAAVAg&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=Mzky",
        "content": "Exibe os pedidos de exportação que foram processados de forma separada ou já faturados, oferecendo uma visão do status e da performance dessas transações."
      },
      {
        "id": "faq_pedido_exportacao",
        "title": "FAQ – Pedido de Exportação 100% (Faturado Separado)",
        "url": "https://helpsinge.lince.com.br/faq_pedido_de_exportacao_100__faturado_separado.html?ms=BQAAAgAABgAAGBAIBAFAAVAgAQ%3D%3D&st=MA%3D%3D&sct=MTE3MA%3D%3D&mw=Mzky",
        "content": "Página de FAQ que esclarece dúvidas sobre o processo de pedidos de exportação, com ênfase em operações onde o faturamento é realizado de forma separada."
      },
      {
        "id": "status_pedido_kanban_exportacao",
        "title": "Status do Pedido – Kanban",
        "url": "https://helpsinge.lince.com.br/status_pedido_kanban_.html?ms=BQAAAgAABgAAGBAIBAFAAVAgAQ%3D%3D&st=MA%3D%3D&sct=MTc5MA%3D%3D&mw=Mzky",
        "content": "Interface que apresenta o status dos pedidos de exportação através de um sistema Kanban, permitindo aos gestores monitorar e atualizar o progresso das transações."
      },
      {
        "id": "comercial_home",
        "title": "Comercial",
        "url": "https://helpsinge.lince.com.br/comercial.html?ms=AQAAAgAABgAAGBAIAUABUCAB&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página principal da área Comercial, que apresenta a visão geral das estratégias, metas e operações do setor de vendas."
      },
      {
        "id": "arquitetura_modulo_17",
        "title": "Arquitetura do Módulo 17",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_17.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=NDAw&mw=Mzky",
        "content": "Detalhamento da estrutura e dos fluxos do Módulo 17, focado nas funcionalidades comerciais e na integração dos processos de vendas."
      },
      {
        "id": "acompanhamento_gerente_representante",
        "title": "Acompanhamento Gerente por Representante",
        "url": "https://helpsinge.lince.com.br/acompanhamento_gerente_por_representante__.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=NDAw&mw=Mzky",
        "content": "Interface que permite aos gerentes monitorar o desempenho dos representantes de vendas, acompanhando metas e resultados."
      },
      {
        "id": "analise_margem_contribuicao",
        "title": "Análise de Margem de Contribuição",
        "url": "https://helpsinge.lince.com.br/analise_de_margem_de_contribuicao_.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Ferramenta que apresenta análises da margem de contribuição dos produtos, auxiliando na definição de estratégias de precificação e rentabilidade."
      },
      {
        "id": "acompanhamento_de_vendas",
        "title": "Acompanhamento de Vendas",
        "url": "https://helpsinge.lince.com.br/acompanhamento_de_vendas.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página que monitora as vendas, oferecendo dados em tempo real e relatórios para avaliação da performance comercial."
      },
      {
        "id": "clientes_ignoram_politica",
        "title": "Clientes que Ignoram a Política Financeira",
        "url": "https://helpsinge.lince.com.br/clientes_que_ignoram_a_politica_financeira.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Lista e análise dos clientes que não aderem à política financeira, contribuindo para a revisão das estratégias de cobrança e relacionamento."
      },
      {
        "id": "consulta_ciclo_logistico",
        "title": "Consulta de Ciclo Logístico",
        "url": "https://helpsinge.lince.com.br/consulta_ciclo_logistico.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Ferramenta para visualizar o ciclo logístico dos pedidos, desde a entrada até a entrega, contribuindo para a melhoria dos processos operacionais."
      },
      {
        "id": "consulta_de_notas",
        "title": "Consulta de Notas",
        "url": "https://helpsinge.lince.com.br/consulta_de_notas.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página que permite a consulta e verificação de notas fiscais, facilitando o controle dos documentos comerciais."
      },
      {
        "id": "consulta_nota_fiscal_com_critica",
        "title": "Consulta de Nota Fiscal com Crítica",
        "url": "https://helpsinge.lince.com.br/consulta_nota_fiscal_com_critica_.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Interface para identificar notas fiscais que apresentam críticas ou inconsistências, permitindo a tomada de medidas corretivas."
      },
      {
        "id": "emissao_nfs_e",
        "title": "Emissão de NFS-e",
        "url": "https://helpsinge.lince.com.br/emissao_de_nota_fiscal_de_servico_eletronica___nfs_e.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Ferramenta para emissão de Nota Fiscal de Serviço Eletrônica, facilitando a formalização das transações e o cumprimento das obrigações fiscais."
      },
      {
        "id": "estatisticas_mapa_areas_brancas",
        "title": "Estatísticas por Mapa – Áreas Brancas",
        "url": "https://helpsinge.lince.com.br/estatisticas_por_mapa___areas_brancas.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página que exibe estatísticas de vendas organizadas por região, identificando áreas de baixa performance para ações estratégicas."
      },
      {
        "id": "manutencao_arquivos_comerciais",
        "title": "Manutenção e Gerenciamento de Arquivos Comerciais",
        "url": "https://helpsinge.lince.com.br/manutencao__e_gerenciamento_de_arquivos_.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Sistema que gerencia e mantém os arquivos comerciais, garantindo o armazenamento seguro e o fácil acesso aos documentos."
      },
      {
        "id": "objetivo_por_unidade_negocio",
        "title": "Objetivo por Unidade de Negócio",
        "url": "https://helpsinge.lince.com.br/objetivo_por_unidade_de_negocio_.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página que define os objetivos comerciais para cada unidade de negócio, auxiliando no acompanhamento e na medição dos resultados."
      },
      {
        "id": "participacao_representantes_cotas",
        "title": "Participação dos Representantes nas Cotas",
        "url": "https://helpsinge.lince.com.br/__participacao_dos_representantes_nas_cotas_.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Ferramenta que apresenta a participação de cada representante nas quotas de vendas, permitindo análises de desempenho e ajustes estratégicos."
      },
      {
        "id": "parametros_de_vendas",
        "title": "Parâmetros de Vendas",
        "url": "https://helpsinge.lince.com.br/parametros_de_vendas.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página que define os parâmetros e métricas adotados para as vendas, servindo como base para o acompanhamento e análise dos resultados."
      },
      {
        "id": "vencimento_pre_fixado",
        "title": "Vencimento Pré-Fixado",
        "url": "https://helpsinge.lince.com.br/vencimento_pre_fixado_.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Informações sobre condições de vencimento pré-fixado para operações comerciais, influenciando os prazos e a gestão financeira."
      },
      {
        "id": "textil_comercial",
        "title": "Textil",
        "url": "https://helpsinge.lince.com.br/textil_.html?ms=BQAAAAAAAAAAAAAICA%3D%3D&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página relacionada ao setor têxtil, abordando produtos, tendências e estratégias comerciais específicas para este segmento."
      },
      {
        "id": "acompanhamento_venda_diaria",
        "title": "Acompanhamento da Venda Diária",
        "url": "https://helpsinge.lince.com.br/acompanhamento_da_venda_diaria.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE1Ng%3D%3D&mw=Mzky",
        "content": "Ferramenta que monitora as vendas diárias, fornecendo dados e indicadores para apoiar a tomada de decisão e o acompanhamento do desempenho."
      },
      {
        "id": "aprovacao_de_pedidos",
        "title": "Aprovação de Pedidos",
        "url": "https://helpsinge.lince.com.br/aprovacao_de_pedidos.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTA1Ng%3D%3D&mw=Mzky",
        "content": "Interface para aprovação dos pedidos, garantindo que os processos de venda sejam validados de acordo com as políticas comerciais."
      },
      {
        "id": "ativar_desativar_cor_produto",
        "title": "Ativar/Desativar Cor de Produto para Venda",
        "url": "https://helpsinge.lince.com.br/ativar_desativar_cor_de_produto_para_venda.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTA1Ng%3D%3D&mw=Mzky",
        "content": "Ferramenta que permite a customização visual dos produtos, possibilitando alterar a exibição de cores conforme a estratégia de marketing."
      },
      {
        "id": "avaliacao_carteira_de_pedidos",
        "title": "Avaliação de Carteira de Pedidos",
        "url": "https://helpsinge.lince.com.br/avaliacao_de_carteira_de_pedidos.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTA1Ng%3D%3D&mw=Mzky",
        "content": "Página que analisa a carteira de pedidos, permitindo identificar tendências, oportunidades e pontos de melhoria no processo de vendas."
      },
      {
        "id": "cadastros_comerciais",
        "title": "Cadastros Comerciais",
        "url": "https://helpsinge.lince.com.br/cadastros_comerciais.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTA1Ng%3D%3D&mw=Mzky",
        "content": "Sistema de cadastros que gerencia informações de clientes, representantes, produtos e outros dados essenciais para o setor comercial."
      },
      {
        "id": "cadastro_representante",
        "title": "Cadastro de Representante",
        "url": "https://helpsinge.lince.com.br/cadastro_de_representante_.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTA1Ng%3D%3D&mw=Mzky",
        "content": "Interface para o cadastro de representantes de vendas, permitindo o gerenciamento e o acompanhamento de suas atividades comerciais."
      },
      {
        "id": "clientes_ativos_tele_vendas",
        "title": "Clientes Ativos – Tele Vendas",
        "url": "https://helpsinge.lince.com.br/clientes_ativos___tele_vendas_.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Página que exibe a lista de clientes ativos atendidos pelo canal de tele vendas, contribuindo para o monitoramento e a segmentação do público."
      },
      {
        "id": "consulta_alteracoes_clientes",
        "title": "Consulta de Alterações no Cadastro de Clientes",
        "url": "https://helpsinge.lince.com.br/consulta_alteracoes_no_cadastro_de_clientes.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Ferramenta que permite a verificação das alterações realizadas no cadastro de clientes, garantindo a atualização e a integridade dos dados."
      },
      {
        "id": "cancelamento_notas_fiscais",
        "title": "Cancelamento de Notas Fiscais",
        "url": "https://helpsinge.lince.com.br/cancelamento_de_notas_fiscais_.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Interface para o cancelamento de notas fiscais, permitindo corrigir erros e regularizar a documentação comercial."
      },
      {
        "id": "carta_correcao_eletronica",
        "title": "Carta de Correção Eletrônica",
        "url": "https://helpsinge.lince.com.br/carta_de_correcao_eletronica_.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Página para emissão de carta de correção eletrônica, possibilitando a correção de dados em notas fiscais sem a necessidade de cancelamento."
      },
      {
        "id": "consultas_pedidos_notas_carteira",
        "title": "Consultas de Pedidos, Notas Fiscais e Carteira de Pedidos",
        "url": "https://helpsinge.lince.com.br/consultas_de_pedidos__notas_fiscais_e_carteira_de_pedidos.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Ferramenta integrada que permite consultar informações de pedidos, notas fiscais e carteira de pedidos, oferecendo uma visão unificada das operações comerciais."
      },
      {
        "id": "consulta_estatisticas_embarque",
        "title": "Consulta de Estatísticas de Embarque",
        "url": "https://helpsinge.lince.com.br/consulta_estatisticas_de_embarque.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Página que apresenta estatísticas dos embarques, facilitando o monitoramento da performance logística das operações de vendas."
      },
      {
        "id": "consulta_estatistica_pre_sugestao",
        "title": "Consulta de Estatística de Pré-Sugestão de Pedidos",
        "url": "https://helpsinge.lince.com.br/consulta_estatistica_de_pre_sugestao_de_pedidos.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Ferramenta que fornece dados para a pré-sugestão de pedidos, ajudando na previsão de demanda e no planejamento comercial."
      },
      {
        "id": "consulta_aprovacao_acoes",
        "title": "Consulta e Aprovação de Ações Comerciais",
        "url": "https://helpsinge.lince.com.br/consulta_e_aprovacao_de_acoes_comerciais_.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTE4OA%3D%3D&mw=Mzky",
        "content": "Interface que permite a consulta e a aprovação de ações comerciais, integrando estratégias de marketing e vendas para otimização dos resultados."
      },
      {
        "id": "consulta_pendencias_vendas",
        "title": "Consulta das Pendências e Vendas",
        "url": "https://helpsinge.lince.com.br/consulta_as_pendencias_e_vendas__.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Ferramenta para visualizar as pendências relacionadas às vendas, permitindo o acompanhamento e a resolução de problemas operacionais."
      },
      {
        "id": "cancelamento_ard",
        "title": "Cancelamento da ARD",
        "url": "https://helpsinge.lince.com.br/cancelamento_da_ard.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Página destinada ao cancelamento da ARD, gerenciando ajustes e correções necessárias no processo de autorização de recebimento de documentos."
      },
      {
        "id": "desativacao_produtos",
        "title": "Desativação de Produtos",
        "url": "https://helpsinge.lince.com.br/desativacao_de_produtos.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Interface que permite a desativação de produtos no catálogo comercial, removendo itens desatualizados ou obsoletos."
      },
      {
        "id": "digitacao_pedidos_call_center",
        "title": "Digitação de Pedidos – Call Center",
        "url": "https://helpsinge.lince.com.br/digitacao_de_pedidos___call_center.html?ms=BQAACAAAAAAAAAAICAQ%3D&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Ferramenta destinada à entrada de pedidos realizados via call center, integrando informações para o processamento das vendas."
      },
      {
        "id": "produtos_cliente_nao_compra",
        "title": "Produtos que o Cliente Não Compra",
        "url": "https://helpsinge.lince.com.br/produtos_que_o_cliente_nao_compra.html?ms=BQAACAAAEAAAAAAICAQQ&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Página que analisa os produtos com baixa aceitação, ajudando a identificar oportunidades para ajustar o mix de produtos e estratégias comerciais."
      },
      {
        "id": "digitacao_pedidos_comercial",
        "title": "Digitação de Pedidos – Comercial",
        "url": "https://helpsinge.lince.com.br/digitacao_de_pedidos___comercial.html?ms=BQAACAAAEAAAAAAICAQQ&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Interface para a entrada manual de pedidos no setor comercial, garantindo que os dados necessários sejam capturados para o processamento das vendas."
      },
      {
        "id": "digitacao_ard",
        "title": "Digitação da ARD",
        "url": "https://helpsinge.lince.com.br/digitacao_da_ard.html?ms=BQAACAAAEAAAAAAICAQQ&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Ferramenta para registrar a ARD (Autorização de Recebimento de Documentos), padronizando os processos de validação e controle documental."
      },
      {
        "id": "relatorio_devolucao_refaturamento",
        "title": "Relatório – Criação de Devolução do Refaturamento",
        "url": "https://helpsinge.lince.com.br/relatorio___cria_devolucao_do_refaturamento.html?ms=BQAACAAAEAAAAAAICARQ&st=MA%3D%3D&sct=MTI4OA%3D%3D&mw=Mzky",
        "content": "Página que gera relatórios detalhados sobre a criação de devoluções relativas ao refaturamento, auxiliando na análise de ajustes financeiros."
      },
      {
        "id": "emissao_notas_fiscais_devolucao",
        "title": "Emissão de Notas Fiscais – Devolução Integral",
        "url": "https://helpsinge.lince.com.br/emissao_de_notas_fiscais___devolucao_integral.html?ms=BQAACAAAEAAAAAAICARQ&st=MA%3D%3D&sct=MjA4Ng%3D%3D&mw=Mzky",
        "content": "Interface para emissão de notas fiscais de devolução integral, garantindo a regularização fiscal e a atualização dos registros de venda."
      },
      {
        "id": "gs512_elementos_codificados",
        "title": "GS512 – Elementos de Itens Codificados",
        "url": "https://helpsinge.lince.com.br/gs512___elementos_de_itens_codificados_.html?ms=BQAACAAAEAAAAAAICARQ&st=MA%3D%3D&sct=MjA4Ng%3D%3D&mw=Mzky",
        "content": "Página que detalha o módulo GS512, explicando a codificação dos itens e auxiliando no gerenciamento e categorização dos produtos no sistema comercial."
      },
      {
        "id": "estatisticas_do_cliente",
        "title": "Estatísticas do Cliente",
        "url": "https://helpsinge.lince.com.br/estatisticas_do_cliente.html?ms=BQAACAAAEAAAAAAICARQ&st=MA%3D%3D&sct=MjA4Ng%3D%3D&mw=Mzky",
        "content": "Ferramenta que apresenta estatísticas sobre os clientes, analisando comportamento de compra e auxiliando na segmentação e estratégias de fidelização."
      },
      {
        "id": "geracao_acao_programada",
        "title": "Geração de Ação Programada",
        "url": "https://helpsinge.lince.com.br/geracao_de_acao_programada.html?ms=BQAACAAAMAAAAAAICARQAQ%3D%3D&st=MA%3D%3D&sct=MTQ0Ng%3D%3D&mw=Mzky",
        "content": "Página que permite a criação automatizada de ações programadas, integrando estratégias comerciais e campanhas de vendas."
      },
      {
        "id": "faturamento_fios_domesticos",
        "title": "Faturamento de Fios Domésticos",
        "url": "https://helpsinge.lince.com.br/faturamento_de_fios_domesticos.html?ms=BQAACAAAMAAAAAAICARQAQ%3D%3D&st=MA%3D%3D&sct=MjEzNg%3D%3D&mw=Mzky",
        "content": "Ferramenta específica para o faturamento de pedidos de fios domésticos, com informações sobre preços, volumes e condições comerciais do segmento."
      },
      {
        "id": "posicao_das_vendas",
        "title": "Posição das Vendas",
        "url": "https://helpsinge.lince.com.br/posicao_das_vendas_.html?ms=BQAACAAAMAAAAAAICARQAQ%3D%3D&st=MA%3D%3D&sct=MTQ4NQ%3D%3D&mw=Mzky",
        "content": "Página que apresenta indicadores e relatórios com a posição atual das vendas, permitindo aos gestores acompanhar o desempenho comercial."
      },
      {
        "id": "emissao_etiquetas_caixas",
        "title": "Emissão de Etiquetas de Caixas de Fios Industriais",
        "url": "https://helpsinge.lince.com.br/emissao_de_etiquetas_de_caixas_de_fios_industriais_.html?ms=BQAACAAAMAAAAAAICARQBQ%3D%3D&st=MA%3D%3D&sct=MTQ4NQ%3D%3D&mw=Mzky",
        "content": "Ferramenta para emissão de etiquetas para caixas de fios industriais, contribuindo para a organização e rastreamento dos produtos."
      },
      {
        "id": "relacionar_cnpj",
        "title": "Relacionar CNPJ ao CNPJ Principal",
        "url": "https://helpsinge.lince.com.br/relacionar_cnpj_ao_cnpj_principal_.html?ms=BQAACAAAMAAAAAAICARQBQ%3D%3D&st=MA%3D%3D&sct=MTUyNA%3D%3D&mw=Mzky",
        "content": "Interface que permite a associação de CNPJs secundários ao principal, otimizando a gestão de clientes e fornecedores na área comercial."
      },
      {
        "id": "setores_aprovacao_ard",
        "title": "Setores para Aprovação da ARD",
        "url": "https://helpsinge.lince.com.br/setores_para_aprovacao_da_ard.html?ms=BQAACAAAMAAAAAAICARQBQ%3D%3D&st=MA%3D%3D&sct=MTUyNA%3D%3D&mw=Mzky",
        "content": "Página que organiza os setores responsáveis pela aprovação da ARD, garantindo um fluxo de autorização eficiente nos processos comerciais."
      },
      {
        "id": "plastico_5",
        "title": "Plástico 5",
        "url": "https://helpsinge.lince.com.br/plastico_5.html?ms=BQAACAAAMAAAAAAICARQBQ%3D%3D&st=MA%3D%3D&sct=MTUyNA%3D%3D&mw=Mzky",
        "content": "Informações sobre o módulo 'Plástico 5', que trata de parâmetros e configurações específicas para a gestão de produtos no ambiente comercial."
      },
      {
        "id": "aprovacao_eletronica_vendas",
        "title": "Aprovação Eletrônica de Vendas",
        "url": "https://helpsinge.lince.com.br/aprovacao_eletronica_de_vendas_.html?ms=BQAACAAAMAAAAAAICAxQBQ%3D%3D&st=MA%3D%3D&sct=MjM4Mg%3D%3D&mw=Mzky",
        "content": "Sistema que permite a aprovação eletrônica de vendas, agilizando o processo de validação das transações e a execução das operações comerciais."
      },
      {
        "id": "bloqueio_ordens_embarque",
        "title": "Bloqueio de Ordens de Embarque",
        "url": "https://helpsinge.lince.com.br/bloqueio_de_ordens_de_embarque.html?ms=BQAACAAAMAAAAAAICAxQBQ%3D%3D&st=MA%3D%3D&sct=MTY4MQ%3D%3D&mw=Mzky",
        "content": "Ferramenta que permite bloquear ordens de embarque, garantindo o controle e evitando liberações indevidas no processo de envio de produtos."
      },
      {
        "id": "integracoes_link_pagamentos",
        "title": "Integrações de Link de Pagamentos",
        "url": "https://helpsinge.lince.com.br/integracoes_de_link_de_pagamentos_.html?ms=BQAACAAAMAAAAAAICAxQBQ%3D%3D&st=MA%3D%3D&sct=MTY4MQ%3D%3D&mw=Mzky",
        "content": "Página que apresenta as integrações com sistemas de link de pagamentos, permitindo a realização de transações online de forma segura."
      },
      {
        "id": "sugestao_de_pedidos",
        "title": "Sugestão de Pedidos",
        "url": "https://helpsinge.lince.com.br/sugestao_de_pedidos_.html?ms=BQAACAAAMAAAAAAICAxQBQ%3D%3D&st=MA%3D%3D&sct=MTY4MQ%3D%3D&mw=Mzky",
        "content": "Ferramenta que gera sugestões de pedidos com base em análises de vendas e estoque, contribuindo para o planejamento comercial e a reposição de produtos."
      },
      {
        "id": "call_center",
        "title": "Call Center",
        "url": "https://helpsinge.lince.com.br/call_center.html?ms=BQAACAAAMAAAAAAICAxQBQ%3D%3D&st=MA%3D%3D&sct=MTY4MQ%3D%3D&mw=Mzky",
        "content": "Interface dedicada ao atendimento via call center, integrando informações e funcionalidades para suporte e processamento de pedidos comerciais."
      },
      {
        "id": "estatisticas_call_center",
        "title": "Estatísticas do Call Center",
        "url": "https://helpsinge.lince.com.br/estatisticas_do_call_center_.html?ms=BQAACAAAMAAAAAAICBxQBQ%3D%3D&st=MA%3D%3D&sct=MjQzMQ%3D%3D&mw=Mzky",
        "content": "Página que exibe estatísticas detalhadas do desempenho do call center, com indicadores que ajudam a melhorar o atendimento e as operações comerciais."
      },
      {
        "id": "marketing_home",
        "title": "Marketing",
        "url": "https://helpsinge.lince.com.br/marketing.html?ms=AQAACAAAMAAAAAAIHFAF&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página principal da área de Marketing, apresentando as estratégias, campanhas e iniciativas que promovem a marca e impulsionam as vendas."
      },
      {
        "id": "cadastro_artesa",
        "title": "Cadastro de Artesa",
        "url": "https://helpsinge.lince.com.br/cadastro_de_artesa___.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Interface para o cadastro de artesa, possivelmente para a gestão de elementos artísticos e visuais que compõem as campanhas e peças de marketing."
      },
      {
        "id": "cadastro_banners",
        "title": "Cadastro de Banners",
        "url": "https://helpsinge.lince.com.br/cadastro_de_banners_.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página destinada ao cadastro e gerenciamento de banners promocionais, essenciais para campanhas publicitárias e divulgação online."
      },
      {
        "id": "cadastro_email_campaign",
        "title": "Cadastro de Campanha de E-mail",
        "url": "https://helpsinge.lince.com.br/cadastro_de_campa_de_e_mail.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Ferramenta para criação e gerenciamento de campanhas de e-mail marketing, permitindo o envio de newsletters, promoções e comunicados aos clientes."
      },
      {
        "id": "cadastro_ebooks",
        "title": "Cadastro de E-books",
        "url": "https://helpsinge.lince.com.br/cadastro_de_e_books.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Interface para o cadastro e distribuição de e-books, utilizados como estratégia de marketing de conteúdo para gerar leads e nutrir clientes."
      },
      {
        "id": "cadastro_job",
        "title": "Cadastro de Job",
        "url": "https://helpsinge.lince.com.br/cadastro_de_job__.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página para o cadastro de jobs, que pode incluir a gestão de projetos e tarefas relacionadas a campanhas e atividades promocionais."
      },
      {
        "id": "controle_eventos",
        "title": "Controle de Eventos",
        "url": "https://helpsinge.lince.com.br/controle_de_eventos_.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Sistema de controle de eventos de marketing, que permite monitorar, agendar e avaliar a realização de eventos promocionais."
      },
      {
        "id": "consulta_jobs",
        "title": "Consulta de Jobs",
        "url": "https://helpsinge.lince.com.br/consulta_de_job__.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Ferramenta para consulta dos jobs cadastrados, facilitando o acompanhamento e a análise dos projetos e campanhas de marketing em andamento."
      },
      {
        "id": "envio_notificacoes",
        "title": "Envio de Notificações",
        "url": "https://helpsinge.lince.com.br/envio_de_notificacoes_.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página destinada ao envio de notificações para clientes e prospects, mantendo o público informado sobre novidades, promoções e atualizações."
      },
      {
        "id": "liberacao_job",
        "title": "Liberação de Job",
        "url": "https://helpsinge.lince.com.br/liberacao_de_job__.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Interface que permite a liberação de jobs, autorizando o início de campanhas e ações promocionais após a aprovação dos responsáveis."
      },
      {
        "id": "transferencia_jobs",
        "title": "Transferência de Jobs",
        "url": "https://helpsinge.lince.com.br/transferencia_de_jobs___.html?ms=BQAAAAAAAAAAAAAIEA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Ferramenta para a transferência de jobs entre setores ou equipes, possibilitando a redistribuição de tarefas e a continuidade das campanhas de marketing."
      },
      {
        "id": "po_1",
        "title": "Plano Operacional",
        "url": "https://helpsinge.lince.com.br/plano_operacional.html?ms=AQAAAAAAAAAAAAAI&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página que apresenta o plano operacional da empresa, detalhando estratégias, metas e diretrizes para o desempenho das operações."
      },
      {
        "id": "po_2",
        "title": "Cadastro de Contas do Plano Operacional",
        "url": "https://helpsinge.lince.com.br/cadastro_de_contas_do_plano_operacional_.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=MzAw&mw=Mzky",
        "content": "Interface para o cadastro e gerenciamento das contas que compõem o plano operacional, possibilitando o controle financeiro e contábil das operações."
      },
      {
        "id": "po_3",
        "title": "Cadastro da Ficha Técnica para Apropriação de Despesas",
        "url": "https://helpsinge.lince.com.br/cadastro_da_ficha_tecnica_para_apropriacao_de_despesas__.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Página destinada ao cadastro da ficha técnica utilizada para a apropriação de despesas operacionais, auxiliando no controle e na alocação dos custos."
      },
      {
        "id": "po_4",
        "title": "Cadastro de Parâmetros do Orçamento - Índices",
        "url": "https://helpsinge.lince.com.br/cadastro_de_parametros_do_orcamento___indices.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Ferramenta para o cadastro de parâmetros orçamentários, com foco nos índices, essenciais para a elaboração e acompanhamento do orçamento."
      },
      {
        "id": "po_5",
        "title": "Cadastro de Parâmetros do Orçamento - Encargo de Pessoal",
        "url": "https://helpsinge.lince.com.br/cadastro_de_parametros_do_orcamento___encargo_de_pessoal.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Interface para o registro dos parâmetros relacionados aos encargos de pessoal, permitindo o controle dos custos com recursos humanos no orçamento."
      },
      {
        "id": "po_6",
        "title": "Cadastro do P.O. de Vendas",
        "url": "https://helpsinge.lince.com.br/cadastro_do_p_o_de_vendas.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Página para o cadastro do Plano Operacional de Vendas, onde são definidas as metas e estratégias para a área comercial."
      },
      {
        "id": "po_7",
        "title": "Consulta de Composição das Contas do Demonstrativo do P.O.",
        "url": "https://helpsinge.lince.com.br/consulta_composicao_das_contas_do_demonstrativo_do_po.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Ferramenta de consulta que exibe a composição das contas utilizadas no demonstrativo do plano operacional, facilitando a análise financeira e a conciliação contábil."
      },
      {
        "id": "po_8",
        "title": "Insumos e Índices Técnicos",
        "url": "https://helpsinge.lince.com.br/insumos_indices_tecnicos__.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Página que reúne informações sobre os insumos e índices técnicos, utilizados para compor e monitorar o orçamento e a performance operacional."
      },
      {
        "id": "po_9",
        "title": "Lançamento das Despesas do P.O.",
        "url": "https://helpsinge.lince.com.br/lancamento_das_despesas_do_p_o.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Interface para o lançamento e registro das despesas operacionais, fundamental para o controle financeiro do plano operacional."
      },
      {
        "id": "po_10",
        "title": "Linha de Produtos",
        "url": "https://helpsinge.lince.com.br/linha_de_produtos.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Página que apresenta a linha de produtos planejada, permitindo a análise e o gerenciamento do portfólio de produtos dentro do plano operacional."
      },
      {
        "id": "po_11",
        "title": "Relação Entre Contas do P.O.",
        "url": "https://helpsinge.lince.com.br/relacao_entre_contas_do_p_o.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Ferramenta que relaciona as diferentes contas que compõem o plano operacional, facilitando a análise e o cruzamento de informações contábeis."
      },
      {
        "id": "po_12",
        "title": "Relacionar Usuário x Centro de Custo",
        "url": "https://helpsinge.lince.com.br/relacionar_usuario_x_centro_de_custo.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Interface que permite associar usuários aos centros de custo, auxiliando na correta alocação de despesas e na gestão operacional."
      },
      {
        "id": "po_13",
        "title": "Simulação de Demonstrativo de Resultados do P.O.",
        "url": "https://helpsinge.lince.com.br/simula_demonstrativo_de_resultados_do_po.html?ms=BQAAAAAAAAAAAAAIIA%3D%3D&st=MA%3D%3D&sct=Njk%3D&mw=Mzky",
        "content": "Ferramenta de simulação que gera um demonstrativo de resultados com base no plano operacional, permitindo prever o desempenho financeiro e operacional."
      },
      {
        "id": "lince_shop_1",
        "title": "Venda a Funcionários",
        "url": "https://helpsinge.lince.com.br/venda_a_funcionarios.html?ms=AQAAAAAAAAAAAAAI&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Esta página apresenta a solução de venda a funcionários, oferecendo condições exclusivas para os colaboradores da empresa, com promoções e ofertas diferenciadas, integrando os canais de venda internos à estratégia comercial."
      },
      {
        "id": "lince_shop_2",
        "title": "Arquitetura do Módulo 18 - Lince Shop",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_18.html?ms=BQAAAAAAAAAAAAAIQA%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Esta página detalha a arquitetura técnica do Módulo 18, que é parte integrante do sistema Lince Shop, explicando a estrutura, os componentes e os processos que suportam a operação e o gerenciamento das vendas para funcionários."
      },
      {
        "id": "manutencao_1",
        "title": "Página Principal de Manutenção",
        "url": "https://helpsinge.lince.com.br/manutencao.html?ms=AQAAAAAAAAAAAAAI&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página principal do módulo de Manutenção, onde são exibidas informações gerais, funcionalidades e recursos destinados ao gerenciamento e monitoramento das atividades de manutenção no ambiente industrial."
      },
      {
        "id": "manutencao_2",
        "title": "Arquitetura do Módulo 19",
        "url": "https://helpsinge.lince.com.br/arquitetura_do_modulo_19.html?ms=CQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Detalhamento da arquitetura técnica do Módulo 19, que faz parte do sistema de manutenção, apresentando a estrutura, componentes e fluxos de dados que suportam as operações de manutenção."
      },
      {
        "id": "manutencao_3",
        "title": "Plástico 6",
        "url": "https://helpsinge.lince.com.br/plastico_6.html?ms=CQAAAAAAAAAAAAAIAQ%3D%3D&st=MA%3D%3D&sct=MzYw&mw=Mzky",
        "content": "Página que descreve o componente 'Plástico 6', possivelmente relacionado a peças ou materiais utilizados nos processos de manutenção e que influenciam o desempenho dos equipamentos."
      },
      {
        "id": "manutencao_4",
        "title": "Controle das Ordens de Manutenção - Versão 1",
        "url": "https://helpsinge.lince.com.br/controle_das_ordens_de_manutencao_1.html?ms=CQAAAAEAAAAAAAAIAQI%3D&st=MA%3D%3D&sct=MzYw&mw=Mzky",
        "content": "Interface para o controle e registro das ordens de manutenção (versão 1), permitindo o acompanhamento e a gestão das intervenções realizadas nos equipamentos e instalações."
      },
      {
        "id": "manutencao_5",
        "title": "Setor Têxtil – Manutenção (Textil 3)",
        "url": "https://helpsinge.lince.com.br/textil_3.html?ms=CQAAAAEAAAAAAAAIAQI%3D&st=MA%3D%3D&sct=MTA5&mw=Mzky",
        "content": "Página voltada para a manutenção no setor têxtil, com informações específicas sobre processos, equipamentos e procedimentos aplicados nesta área."
      },
      {
        "id": "manutencao_6",
        "title": "Cadastro de Usuários e Motivos de Manutenção",
        "url": "https://helpsinge.lince.com.br/cadastro_de_usuario_e_motivos_de_manutencao.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=NDEw&mw=Mzky",
        "content": "Tela para o cadastro de usuários responsáveis pelas manutenções e para o registro dos motivos que justificam as intervenções, auxiliando na análise e na melhoria dos processos."
      },
      {
        "id": "manutencao_7",
        "title": "Controle das Ordens de Manutenção - Versão 2",
        "url": "https://helpsinge.lince.com.br/controle_das_ordens_de_manutencao_2.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg4&mw=Mzky",
        "content": "Interface atualizada para o controle das ordens de manutenção (versão 2), com funcionalidades aprimoradas para o monitoramento e a gestão detalhada das atividades de manutenção."
      },
      {
        "id": "manutencao_8",
        "title": "Cadastro de Usuários por Grupos de Manutenção",
        "url": "https://helpsinge.lince.com.br/cadastro_de_usuarios_por_grupos_de_manutencao.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Página para o cadastro e organização de usuários em grupos específicos, facilitando a gestão de equipes e a definição de responsabilidades dentro do módulo de manutenção."
      },
      {
        "id": "manutencao_9",
        "title": "Cadastro e Consulta de Máquinas",
        "url": "https://helpsinge.lince.com.br/cadastro_e_consulta_de_maquinas.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Sistema para cadastro e consulta de máquinas, possibilitando a visualização do histórico, do status e do planejamento de manutenções dos equipamentos utilizados na operação."
      },
      {
        "id": "manutencao_10",
        "title": "Cadastro de Parâmetros de Manutenção",
        "url": "https://helpsinge.lince.com.br/cadastro_de_parametros_de_manutencao.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Tela destinada à configuração de parâmetros e critérios para a realização das manutenções, definindo intervalos, prioridades e procedimentos operacionais."
      },
      {
        "id": "manutencao_11",
        "title": "Cadastro do Fluxo de Manutenção",
        "url": "https://helpsinge.lince.com.br/cadastro_de_fluxo_de_manutencao.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Interface para o cadastro e gerenciamento do fluxo de manutenção, organizando as etapas dos processos de manutenção e a sequência de ações necessárias para a execução das intervenções."
      },
      {
        "id": "manutencao_12",
        "title": "Cadastro de Causas e Detalhamento de Manutenção",
        "url": "https://helpsinge.lince.com.br/cadastro_de_causa_detalhamento_de_manutencao.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Página para o registro detalhado das causas que motivam as intervenções de manutenção, permitindo análises de falhas e o aprimoramento dos processos operacionais."
      },
      {
        "id": "manutencao_13",
        "title": "Consulta de Horas Paradas em Manutenção",
        "url": "https://helpsinge.lince.com.br/consulta_relacao_horas_paradas_de_manutencao.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Ferramenta para consulta da relação de horas em que os equipamentos ficaram parados devido a manutenções, possibilitando a análise da eficiência e do impacto das intervenções."
      },
      {
        "id": "manutencao_14",
        "title": "Consulta de Bobinados e Componentes Eletrônicos",
        "url": "https://helpsinge.lince.com.br/consulta_de_bobinados_e_eletronico.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=NTA4&mw=Mzky",
        "content": "Página que oferece consulta de informações relativas aos bobinados e componentes eletrônicos, elementos essenciais em alguns equipamentos e processos de manutenção."
      },
      {
        "id": "manutencao_15",
        "title": "Controle de Bobinados e Componentes Eletrônicos",
        "url": "https://helpsinge.lince.com.br/controle_de_bobinados_e_eletronico_.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg4&mw=Mzky",
        "content": "Interface que permite o controle e monitoramento dos bobinados e componentes eletrônicos, assegurando a operação correta e a manutenção preventiva dos sistemas que os utilizam."
      },
      {
        "id": "manutencao_16",
        "title": "Gerenciamento de Permissões para Manutenção",
        "url": "https://helpsinge.lince.com.br/permissoes_para_usuarios_da_manutencao.html?ms=CQAAAAEAAAAAAAAIAQY%3D&st=MA%3D%3D&sct=MTg4&mw=Mzky",
        "content": "Página para configuração e gerenciamento das permissões de acesso para os usuários do módulo de manutenção, definindo os níveis de autorização e as responsabilidades de cada perfil."
      },
      {
        "id": "suporte_1",
        "title": "Página de Suporte",
        "url": "https://helpsinge.lince.com.br/suporte.html?ms=AQAAAAEAAAAAAAAIBg%3D%3D&st=MA%3D%3D&sct=MA%3D%3D&mw=Mzky",
        "content": "Página principal de suporte, oferecendo informações gerais, FAQs e links para recursos de ajuda e resolução de problemas, facilitando o acesso dos usuários à assistência técnica."
      },
      {
        "id": "suporte_2",
        "title": "Abertura de Chamados",
        "url": "https://helpsinge.lince.com.br/_abertura_de_chamados.html?ms=CQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=NDU5&mw=Mzky",
        "content": "Interface para abertura de chamados, permitindo aos usuários registrar incidentes e solicitar suporte técnico de forma organizada e documentada."
      },
      {
        "id": "suporte_3",
        "title": "Cadastro de CEP",
        "url": "https://helpsinge.lince.com.br/cadastro_de_cep.html?ms=CQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Página para cadastro de CEPs, possivelmente utilizada para associar dados de localização a chamados ou para validar endereços nos registros de suporte."
      },
      {
        "id": "suporte_4",
        "title": "Cadastro de CEP Internacional",
        "url": "https://helpsinge.lince.com.br/cadastro_de_cep_internacional_.html?ms=CQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Interface destinada ao cadastro de CEPs internacionais, ampliando o suporte para usuários e operações fora do território nacional."
      },
      {
        "id": "suporte_5",
        "title": "Cadastro de Dados para Assinatura",
        "url": "https://helpsinge.lince.com.br/cadastro_de_dados_para_assinatura.html?ms=CQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Página para o cadastro de informações necessárias para assinaturas digitais, garantindo a validação e segurança dos documentos eletrônicos."
      },
      {
        "id": "suporte_6",
        "title": "Consulta de Status dos Chamados",
        "url": "https://helpsinge.lince.com.br/consulta_status_dos_chamados.html?ms=CQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Ferramenta que permite aos usuários consultar o status de seus chamados abertos, acompanhando o andamento das solicitações de suporte técnico."
      },
      {
        "id": "suporte_7",
        "title": "Impressão de Relatórios",
        "url": "https://helpsinge.lince.com.br/impressao_de_relatorios_.html?ms=CQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Página para impressão de relatórios relacionados às atividades de suporte, permitindo a geração de documentos para análise e acompanhamento dos atendimentos."
      },
      {
        "id": "suporte_8",
        "title": "Manutenção de Ramais",
        "url": "https://helpsinge.lince.com.br/manutencao_de_ramais_.html?ms=CQAAAAAAAAAAAAAIAg%3D%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Interface voltada para a gestão e manutenção de ramais telefônicos, assegurando que as comunicações internas e externas ocorram sem problemas."
      },
      {
        "id": "suporte_9",
        "title": "Alteração de Nomenclatura na Bina Telefônica",
        "url": "https://helpsinge.lince.com.br/alteracao_da_nomenclatura_na_bina_telefonica_.html?ms=CQAAAAQAAAAAAAAIAhA%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Página destinada à alteração da nomenclatura das linhas telefônicas (Bina), facilitando a identificação e organização das comunicações durante o atendimento."
      },
      {
        "id": "suporte_10",
        "title": "Gerenciamento de Acesso Externo",
        "url": "https://helpsinge.lince.com.br/gerenciamento_de_acesso_externo.html?ms=CQAAAAQAAAAAAAAIAhA%3D&st=MA%3D%3D&sct=MTQ4&mw=Mzky",
        "content": "Interface para o gerenciamento de acessos externos, permitindo o controle de usuários que precisam acessar sistemas ou informações fora da rede corporativa."
      },
      {
        "id": "suporte_11",
        "title": "Gestão de Acessos SINGE",
        "url": "https://helpsinge.lince.com.br/gestao_de_acessos_singe.html?ms=CQAAAAQAAAAAAAAIAhA%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Página que centraliza a administração dos acessos ao sistema SINGE, possibilitando o controle de permissões e a monitorização das atividades dos usuários."
      },
      {
        "id": "suporte_12",
        "title": "Liberação de Usuário por Sequência de Fluxo",
        "url": "https://helpsinge.lince.com.br/liberar_usuario_por_sequencia_de_fluxo.html?ms=CQAAAAQAAAAAAAAIAlA%3D&st=MA%3D%3D&sct=MTg3&mw=Mzky",
        "content": "Ferramenta que permite liberar ou ajustar o acesso dos usuários com base na sequência de fluxo pré-definida, otimizando a gestão de permissões e garantindo a segurança."
      },
      {
        "id": "suporte_13",
        "title": "Cadastro de Fluxos",
        "url": "https://helpsinge.lince.com.br/cadastro_de_fluxos.html?ms=CQAAAAQAAAAAAAAIAlA%3D&st=MA%3D%3D&sct=NjA3&mw=Mzky",
        "content": "Interface para o cadastro de fluxos de trabalho, que inclui processos relacionados ao suporte, ajudando a padronizar e automatizar os procedimentos de atendimento."
      },
      {
        "id": "suporte_14",
        "title": "Gestão de Dados com Power BI",
        "url": "https://helpsinge.lince.com.br/gestao_de_dados_com_power_b_i.html?ms=CQAAAAQAAAAAAAAIAlA%3D&st=MA%3D%3D&sct=NjA3&mw=Mzky",
        "content": "Página que integra o suporte com ferramentas de análise de dados, utilizando Power BI para oferecer dashboards e visualizações que auxiliam no monitoramento dos atendimentos."
      },
      {
        "id": "suporte_15",
        "title": "Relatórios Dinâmicos com Power BI",
        "url": "https://helpsinge.lince.com.br/relatorios_dinamicos_com_power_b_i.html?ms=CQAAAAwAAAAAAAAIAlAB&st=MA%3D%3D&sct=NjA3&mw=Mzky",
        "content": "Ferramenta para geração de relatórios dinâmicos com Power BI, permitindo a criação de análises visuais e customizadas dos dados de suporte."
      },
      {
        "id": "suporte_16",
        "title": "Redirecionamento de E-mails",
        "url": "https://helpsinge.lince.com.br/redirecionamento_de_e_mails_.html?ms=CQAAAAwAAAAAAAAIAlAB&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página que trata do redirecionamento de e-mails, assegurando que as comunicações importantes sejam encaminhadas aos destinatários corretos dentro do suporte."
      },
      {
        "id": "suporte_17",
        "title": "Registro de Chamados",
        "url": "https://helpsinge.lince.com.br/registro_de_chamados.html?ms=CQAAAAwAAAAAAAAIAlAB&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Interface para registro e gerenciamento de chamados, permitindo a documentação detalhada dos incidentes e o acompanhamento do status de cada solicitação de suporte."
      },
      {
        "id": "suporte_18",
        "title": "Solicitação de Acesso Externo",
        "url": "https://helpsinge.lince.com.br/solicitacao_de_acesso_externo.html?ms=CQAAAAwAAAAAAAAIAlAB&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Página onde os usuários podem solicitar acesso externo, gerenciando as autorizações necessárias para acessar recursos fora da rede corporativa."
      },
      {
        "id": "suporte_19",
        "title": "Transferência de Arquivos",
        "url": "https://helpsinge.lince.com.br/transferencia_de_arquivos_.html?ms=CQAAAAwAAAAAAAAIAlAB&st=MA%3D%3D&sct=MzA1&mw=Mzky",
        "content": "Interface para transferência de arquivos, facilitando o compartilhamento de documentos e informações entre os setores de suporte e outras áreas da organização."
      }
];

async function scrapeLink(entry) {
  try {
    const response = await axios.get(entry.url);
    if (!response.headers['content-type'] || !response.headers['content-type'].includes('text/html')) {
      throw new Error('Resposta inesperada: não é HTML');
    }
    const html = response.data;
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    const mainContent = $('main, article, .content').first();
    const text = mainContent.length ? mainContent.text() : $.text();
    console.log(`Scraping concluído para: ${entry.url}`);
    return {
      id: entry.id,
      title: entry.title,
      url: entry.url,
      content: text.trim()
    };
  } catch (error) {
    console.error(`Erro ao processar ${entry.url}:`, error.message);
    return {
      id: entry.id,
      title: entry.title,
      url: entry.url,
      content: ""
    };
  }
}

async function updateKnowledgeBase() {
  console.log("Iniciando atualização da base de conhecimento...");
  const scrapedData = [];
  for (const entry of knowledgeEntries) {
    const data = await scrapeLink(entry);
    scrapedData.push(data);
  }
  
  // Caminho para salvar o arquivo (certifique-se de que este caminho esteja correto)
  const outputPath = path.join(__dirname, '..', 'public', 'knowledgeBase.json');
  console.log("Salvando o arquivo em:", outputPath);
  try {
    const jsonData = JSON.stringify(scrapedData, null, 2);
    // Valida o JSON
    JSON.parse(jsonData);
    fs.writeFileSync(outputPath, jsonData, 'utf8');
    console.log("Base de conhecimento atualizada com sucesso!");
  } catch (err) {
    console.error("Erro ao salvar ou validar o arquivo knowledgeBase.json:", err.message);
  }
}

module.exports = { updateKnowledgeBase };
