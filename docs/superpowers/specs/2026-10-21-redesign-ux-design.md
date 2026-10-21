# Redesign de UX do app Harpa Cristã — Design

_21/10/2026_

## Por que

O app é usado **em casa e na igreja**, para acompanhar os hinos cantados no culto. Quem usa precisa achar o hino anunciado (geralmente pelo número) em segundos e conseguir ler com conforto, muitas vezes em ambiente com pouca luz e com o celular parado na mão durante vários minutos.

O dono do projeto é desenvolvedor backend e delegou as decisões de UX. Hoje o app funciona, mas tem pontos fracos:

- o coração de favorito parece estranho;
- não existe modo escuro;
- não dá para ajustar o tamanho da fonte;
- a tela apaga no meio do hino;
- a busca não ignora acentos;
- o ícone não agrada.

O app vai ser publicado na Play Store.

## Objetivos

1. Abrir o hino anunciado no culto o mais rápido possível.
2. Leitura confortável: tamanho de fonte ajustável, modo escuro e tela que não apaga.
3. Permitir que a pessoa organize hinos em **listas próprias** (por exemplo: Pregação, Sangue, Oração, Consagração) e crie novas listas.
4. Visual mais limpo e coerente, mantendo a identidade "papel envelhecido" (creme e marrom).
5. Novo ícone, aprovado pelo dono: **opção D**, uma capa vinho com moldura dourada, o título "HARPA CRISTÃ" e, no centro, uma pauta com clave de sol e três notas.

## Fora do escopo (não fazer)

- Áudio, playback ou cifras.
- Login, conta, sincronização na nuvem, anúncios ou analytics. O app continua 100% offline e sem coleta de dados, já que a política de privacidade (`PRIVACY.md`) diz isso.
- Classificar hinos automaticamente. As listas sugeridas vêm **vazias**, porque não há fonte confiável para essa classificação.
- Suporte a iOS além do que já funciona hoje. O foco é Android.

## O que seria um fracasso mesmo funcionando

- Ficar mais lento ou com mais toques para abrir um hino pelo número do que hoje.
- Perder os favoritos que os usuários já salvaram (a chave `@harpa_favorites` no AsyncStorage).
- Usar logo ou marca da Assembleia de Deus ou da CPAD, porque isso arrisca recusa na Play Store.
- Ter botões invisíveis ou ações destrutivas sem confirmação.

## Restrições

- O app já usa Expo SDK 54, React Native 0.81, React Navigation 7, AsyncStorage e JavaScript (sem TypeScript). A ideia é continuar nessa base.
- As bibliotecas novas precisam ser compatíveis com o Expo, instaladas com `npx expo install`.
- Os dados ficam em `src/data/hinos.json`: 640 hinos com os campos `{id, numero, titulo, letra}`. Dentro de `letra`:
  - a estrofe começa por uma linha só com o número dela;
  - os versos são separados por `\n`;
  - o coro aparece entre `**…**` e pode ocupar várias linhas (432 hinos têm coro).
- Os textos da interface ficam em português do Brasil.
- `app.json` e `eas.json` já estão configurados para a Play Store e devem continuar funcionando: o nome do pacote, o `projectId` e as permissões bloqueadas não mudam.

## Como vai ficar (decidido)

### Navegação

Uma **barra inferior com 3 abas**:

- **Hinos** (início);
- **Minhas listas**;
- **Ajustes**.

A tela de leitura de um hino e a tela de uma lista abrem por cima das abas, em stack, sem mostrar a barra inferior.

### Tema

- Há três opções: **Claro**, **Escuro** e **Seguir o celular**. O padrão é **Seguir o celular**.
- Cores do tema claro (são as atuais):
  - fundo `#F8F5F0`, cartão `#FFFFFF`;
  - texto `#2C1810`, texto secundário `#8B7355`;
  - destaque `#A0522D`, fundo de chip `#F1EAE0`, linha `#E8DCC8`.
- Cores do tema escuro:
  - fundo `#17120F`, cartão `#231C17`;
  - texto `#EFE6DA`, texto secundário `#A8977F`;
  - destaque `#D9A06B`, chip `#2E251E`, linha `#3A2F27`.
- A cor da barra de status acompanha o tema.
- Os ícones vêm do `@expo/vector-icons`, que já está no Expo. Nada de emoji como ícone.

### Tela Hinos (início)

- Título "Harpa Cristã" e campo de busca com o texto "Número, título ou trecho da letra".
- **Busca:**
  - ignora acentos e diferença entre maiúsculas e minúsculas ("graca" encontra "Graça");
  - procura no número, no título e na letra;
  - se o texto digitado for só um número, o hino com esse número exato aparece primeiro;
  - depois vêm os resultados por título e, por último, os encontrados só na letra.
- **Abertos recentemente:**
  - uma faixa horizontal de chips (número + título curto) com os últimos hinos abertos;
  - aparece só quando a busca está vazia;
  - usa a função `addToRecent` que já existe (guarda até 10).
- **Lista de todos os hinos:**
  - cada linha mostra o número em destaque, o título e um ícone de **marcador** (bookmark);
  - o marcador fica preenchido quando o hino está em Favoritos;
  - tocar no marcador da linha liga ou desliga Favoritos na hora.
- O cabeçalho mostra a contagem real de hinos, sem número fixo no código.

### Tela de leitura do hino

- **Cabeçalho:**
  - botão voltar, "Hino N" pequeno e o título;
  - à direita, o **marcador**: tocar nele abre a janela "Salvar em…".
  - o marcador aparece preenchido quando o hino está em **qualquer** lista. _(Decisão do designer.)_
- Logo abaixo do cabeçalho ficam **etiquetas pequenas** com as listas em que o hino está. Se não estiver em nenhuma, não aparece nada.
- **Letra:**
  - fonte e tamanho seguem os Ajustes;
  - o número de cada estrofe aparece pequeno, na cor de destaque;
  - o **coro** fica num bloco próprio: rótulo "CORO", borda lateral na cor de destaque, fundo de chip e itálico;
  - o coro aparece uma vez, onde está no texto, sem repetir.
- **Barra inferior:**
  - "‹ Hino anterior", **A− / A+** e "Próximo hino ›";
  - a navegação dá a volta: do 640 vai para o 1 e do 1 para o 640;
  - A−/A+ alteram o tamanho global salvo nos Ajustes.
- Abrir um hino registra o hino em "recentes".
- **Tela ligada:** enquanto a leitura está aberta, a tela não apaga, desde que a opção esteja ativa (padrão: ativa). A biblioteca é `expo-keep-awake`.

### Janela "Salvar em…" (bottom sheet)

- Título: `Salvar "<título>" em…`.
- Mostra uma caixa de marcar para cada lista (Favoritos primeiro). O hino pode estar em várias listas.
- No fim, a opção "+ Criar nova lista": pede um nome, cria a lista e já coloca o hino nela.

### Minhas listas

- Grade de cartões. Cada cartão mostra a cor da lista, o nome e "N hinos".
  - **Favoritos** fica sempre em primeiro, com destaque, e não pode ser excluída nem renomeada.
  - O último cartão é "+ Nova lista", com borda tracejada.
- No primeiro uso, o app cria **vazias** as listas **Pregação, Sangue, Oração e Consagração**, cada uma com uma cor. Se a pessoa excluir alguma, ela não volta.
- **Criar lista:** nome obrigatório e escolha de cor numa paleta fixa de cerca de 6 cores.
- **Segurar o dedo num cartão** dá as opções Renomear, Mudar cor e Excluir. Excluir pede confirmação.
- **Tocar num cartão** abre a lista:
  - os hinos aparecem ordenados pelo número;
  - tocar abre a leitura;
  - existe um jeito visível de tirar um hino da lista, com confirmação ou com opção de desfazer.
  - se a lista estiver vazia, aparece uma mensagem explicando como adicionar hinos.

### Ajustes

- **Tema:** Claro / Escuro / Seguir o celular.
- **Tamanho da letra:** um controle com uns 5 a 7 passos, de 16 a 30 pt, e uma **prévia** ao vivo com um verso de exemplo.
- **Tipo de letra:** Serifada (a atual, Georgia/serif) ou Sem serifa.
- **Manter tela ligada durante a leitura:** liga e desliga.
- **Sobre:** versão do app e link para a política de privacidade, que abre no navegador `https://github.com/eduardo7321/harpa-crista-app/blob/main/PRIVACY.md`. É a mesma URL cadastrada na Play Store.
- Todas as preferências ficam salvas no AsyncStorage.

### Dados no aparelho

- As listas ficam salvas no AsyncStorage numa estrutura que guarde, para cada lista: id, nome, cor, os ids dos hinos e se é a lista fixa Favoritos.
- **Migração:** na primeira execução da versão nova, o conteúdo de `@harpa_favorites` vira o conteúdo da lista Favoritos. Nada pode se perder.

### Ícone e tela de abertura

O ícone é a **opção D**:

- fundo vinho em degradê (`#8E2A2A` para `#3A0C0C`);
- moldura dourada dupla;
- "HARPA" no topo e "CRISTÃ" embaixo, em serifada dourada e negrito;
- no centro, uma pauta dourada com clave de sol e três notas.

O SVG de referência está em `docs/superpowers/specs/icone/v_d.svg` (gerado por `cover.py`, na mesma pasta, junto com a prévia `v_d.png`). O texto usa as fontes Noto Serif e Noto Music, então precisa ser convertido para path na hora de rasterizar.

Arquivos a entregar:

- `assets/icon.png`: 1024×1024, quadrado, com a arte completa.
- `assets/adaptive-icon.png`: foreground transparente de 1024×1024, com título, pauta e clave dentro da zona segura central de 66%, **sem a moldura** para não ser cortada. O `backgroundColor` do adaptive icon passa a ser o vinho `#5E1616`.
- Ícone de 512×512 para a página da Play Store.
- Tela de abertura: fundo vinho com o ícone no centro.

## Fica a critério de quem implementar

- A estrutura de pastas e componentes (por exemplo, contexto de tema e de ajustes, hooks e componentes reutilizáveis de cabeçalho e linha).
- A biblioteca do bottom sheet. Pode ser um Modal simples do React Native, desde que fique bom e seja acessível.
- As cores exatas das listas sugeridas e da paleta.
- Animações e microinterações, desde que sejam discretas.
- Os testes: hoje o projeto não tem nenhum. A recomendação é testar pelo menos a busca sem acento, a interpretação da letra e coro e o serviço de listas, incluindo a migração.
- A acessibilidade básica: rótulos `accessibilityLabel` nos botões de ícone, área de toque mínima de cerca de 44 px e contraste adequado nos dois temas.

## Decisões tomadas pelo designer na revisão

- **Ordem de lançamento:** o redesign será a **primeira versão publicada** na Play Store. Ele parte do trabalho de preparação para a loja que ainda não foi commitado nesta branch (`app.json`, `eas.json`, assets e ajustes nas telas). Mesmo assim, a migração de `@harpa_favorites` continua obrigatória, porque já existem APKs de teste instalados.
- **O que o marcador preenchido significa:**
  - na lista de hinos, quer dizer "está em Favoritos", e o toque liga ou desliga Favoritos;
  - na leitura, quer dizer "está em alguma lista", e o toque abre "Salvar em…".
