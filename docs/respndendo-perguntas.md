  Produto, escopo e fluxo

  - A página /form é em Next.js (App Router) ou outro stack? Onde devo criar a rota exatamente?
Criar do zero.
  - Esse formulário deve ser público (sem login) ou exige autenticação?
Sem login, publico.
  - Existe alguma base de código já com shadcn e supabase configurados? Em quais pastas ficam os utilitários?
Nao, criar do zero.
  - O fluxo é multi-etapas com navegação “Voltar/Continuar”? Deve permitir pular etapas opcionais?
Sim, multi-etapas com navegação “Voltar/Continuar”. Se for etapas opcionais, sim, pode pular.
  - Quer progress bar/stepper com indicação de etapa atual e total?
Sim!
  - O usuário pode voltar e editar respostas de etapas anteriores a qualquer momento?
Sim, pode.
  - Quer um “Resumo final” antes de concluir, ou ao final já mostra a tela de agradecimento?
Sim, ao final mostra a tela de agradecimento.
  - Tempo estimado por etapa deve aparecer?
Nao precisa.

  Conteúdo e copy

  - As labels/placeholder devem ficar exatamente como em docs/form.md ou posso ajustar microcopy?
Pode ajustar.
  - Tudo em PT-BR? Precisa versão em EN?
Apenas pt-br.
  - Quer textos de ajuda/descrição em cada campo além dos exemplos?
Sim!
  - Há termos de uso/consentimento LGPD obrigatórios no final?
É ideal inserir um checkbox como termo de aceitação na ETAPA INICIAL, o usuário só poderá prosseguir quando marcar, e este termo de aceite deve ir para o supabase numa coluna especifica.

  Campos e validações (etapas obrigatórias)

  - ETAPA INICIAL: “Nome completo” e “Email” têm regras específicas (mínimo, formato, maxlength)?
Sim, mínimo 3 caracteres, formato email válido, maxlength 255.
  - ETAPA INICIAL: “Outro” na função principal abre campo obrigatório? Como deve se chamar?
“Outro” é um campo livre, pode ser “Qual é a função principal?” ou similar.
  - ETAPA 2 (treinamento): todos esses campos são obrigatórios? Algum limite de caracteres?
Sim, todos os campos sao obrigatórios.
  - ETAPA 2 (produto/serviço): todos obrigatórios? “Descrição detalhada” deve permitir markdown?
Markdown? Para quê?
  - ETAPA 7 (Comunicação): todos obrigatórios? Limites?
Sim, todos os campos são obrigatórios.

  Campos opcionais

  - ETAPA 3 (processo de vendas): deve aparecer apenas se usuário marcar “Meu agente deve vender”? Quer esse toggle explícito?
Sim, aparece apenas se usuário marcar “Meu agente deve vender”.
  - ETAPA 4 (personalização): “Acesso à base de conhecimentos” é upload de arquivos? Quais tipos e tamanho?
Sim, arquivos PDF, DOCX, TXT, ETC... máximo 10MB. E deve subir para o STORAGE do supabase, na pasta deve ter o nome que o usuário preencheu e um ID de identificaçao.
  - ETAPA 5 (integrações): “Sistemas externos” e “funcionalidades” devem ser texto livre ou multi-select com tags?
Veja como fica melhor para a experiencia do usuario.
  - ETAPA 6 (agendamento): “Ferramenta” deve ser select com opções fixas? Quais?
Texto livre.
  - ETAPA 8 (links): permitir múltiplos links com botão “Adicionar link”?
Sim, permitir.
  - ETAPA 9 (informação extra): campo textarea simples? Limite?
Sem limite.

  Supabase e persistência em tempo real

  - Já existe projeto Supabase? Quais env vars devo usar (URL/ANON/SERVICE)?
Inseri todas as credenciais no arquivo: @.env
  - Qual a tabela alvo? Nome e colunas já definidas ou devo criar?
Deve criar tudo.
  - Prefere uma linha única por formulário (JSONB) ou colunas normalizadas por campo?
Faça o que for mais recomendado.
  - Como identificar a “sessão” do usuário sem login? Gerar form_id no primeiro toque e salvar em localStorage?
Sim, o que for mais recomendado!
  - Quer salvar a cada tecla (debounce) ou no blur/step avançar?
No blur/step avançar.
  - Deve existir status (draft/completed) e timestamps por etapa?
Sim, existe.
  - Ao finalizar, deve disparar alguma notificação (email/Slack/webhook)?
Por enquanto nao.

  Realtime

  - “Subir em tempo real” significa salvar incrementalmente no DB, ou também exibir status de salvamento (“Salvando…/Salvo”)?
Sim, também exibir status de salvamento.
  - Precisa de canal realtime para que admins vejam mudanças ao vivo em outro painel?
Sim, precisa, mas nao precisa criar agora.

  Uploads

  - Quais buckets do Supabase Storage? Nomes, política RLS e limites?
Voce que deve criar como recomendado.
  - Quer upload de múltiplos arquivos? Precisa de preview?
Sim, múltiplos arquivos com preview.

  Segurança/privacidade

  - Qual política RLS? Público pode inserir, mas não ler? Precisamos de rate limit?
Sim, politica RLS. faça o melhor recomendado para segurança também.
  - Alguma exigência específica de LGPD (consent checkbox, retention)?
Sim, consent checkbox.


  Design (shadcn)

  - Existe identidade visual (cores, fontes, logo)? Onde está o logo?
O logotipo pode ser um texto por enquanto.
  - Quer layout mais clássico corporativo ou algo mais moderno/ousado?
Moderno, porém pegada business.
  - Preferência de fundo (gradiente, pattern) ou clean?
Clean. Titulo com a fonte DM Sans e textos com a fonte intert. Gradient azul apenas no texto IA FOUR SALES do logotipo.

  Finalização

  - A tela final precisa do ícone em gradiente azul e a mensagem exata do doc — confirma?
Sim, confirma.
  - Deve haver botão “Enviar outro formulário” ou CTA?
Sim, botão “Enviar outro formulário” ou "Editar formulário" e volta para a etapa inicial, porém com tudo preenchido já salvo. Enviar outro formulário deve voltar para a etapa inicial, porém com o formulário vázio, do zero.

  Especificações/SDD

  - Existem docs em docs/specs/ ou outro lugar que definem arquitetura/SDD? Se sim, indique o path.
Nao.