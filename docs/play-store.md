# Publicação na Play Store

Textos e respostas prontos para copiar no Play Console.

## Ficha da loja

**Nome do app** (até 30 caracteres)

```
Harpa Cristã
```

**Descrição curta** (até 80 caracteres)

```
Os 640 hinos da Harpa Cristã, com busca na letra, listas e modo escuro.
```

**Descrição completa** (até 4000 caracteres)

```
Acompanhe os hinos da Harpa Cristã no culto, no ensaio ou em casa.

Encontre qualquer hino em segundos
• Busque pelo número, pelo título ou por um trecho da letra
• A busca ignora acentos: "graca" encontra "Graça"
• Os hinos abertos recentemente ficam no topo

Leitura confortável
• Coro destacado e estrofes numeradas
• Aumente ou diminua a letra com um toque
• Modo claro, escuro ou igual ao do celular
• Letra com ou sem serifa
• A tela não apaga enquanto o hino está aberto
• Passe para o hino anterior ou o próximo sem voltar à lista

Suas listas
• Salve seus hinos preferidos nos Favoritos
• Listas prontas: Pregação, Sangue, Oração e Consagração
• Crie suas próprias listas com nome e cor

Funciona sem internet, não pede cadastro e não coleta nenhum dado.
```

**Imagens**

| Item | Arquivo |
|------|---------|
| Ícone (512×512) | `assets/play-store-icon.png` |
| Imagem de destaque (1024×500) | `assets/play-store-banner.png` |
| Capturas de tela do celular (mínimo 2, ideal 4 a 8) | Tiradas no próprio aparelho |

Sugestão de capturas: tela inicial com busca, leitura de um hino (tema claro), leitura no tema escuro, Minhas listas, janela "Salvar em…" e Ajustes.

Os ícones e a imagem de destaque são gerados por `scripts/gerar-icones.sh`.

## Categorização

- **Categoria:** Música e áudio (alternativa: Estilo de vida)
- **Tags:** Música, Religião
- **E-mail de contato:** o e-mail da conta de desenvolvedor
- **Política de privacidade:** https://github.com/eduardo7321/harpa-crista-app/blob/main/PRIVACY.md

## Conteúdo do app (Política do app)

| Formulário | Resposta |
|------------|----------|
| Política de privacidade | URL acima |
| Anúncios | Não, o app não contém anúncios |
| Acesso ao app | Todas as funcionalidades estão disponíveis sem restrições |
| Público-alvo | 13 anos ou mais (escolher faixas abaixo de 13 exige cumprir a política Famílias) |
| Classificação de conteúdo | Categoria "Referência, notícias ou educação"; responder "Não" a todas as perguntas → Livre |
| Segurança dos dados | Não coleta nem compartilha dados. Os favoritos e listas ficam só no aparelho |
| App de notícias | Não |
| Apps de saúde | Não |
| Apps governamentais | Não |
| Recursos financeiros | Nenhum |
| ID de publicidade | Não usa |

## Passo a passo

1. **Login no Expo:** `npx eas-cli login`
2. **Gerar o AAB:** `npx eas-cli build -p android --profile production`
   - No primeiro build, aceite gerar uma nova keystore. O EAS guarda essa chave, então não a apague da conta Expo.
3. **Criar o app no Play Console:** nome "Harpa Cristã", idioma padrão Português (Brasil), tipo App, gratuito.
4. **Preencher** a ficha da loja e os formulários de "Conteúdo do app" com as respostas acima.
5. **Primeiro envio manual:** baixe o `.aab` do link que o EAS mostra e envie em Testes → Teste interno → Criar versão. A API do Google só aceita envios automáticos depois que existe uma versão enviada à mão.
6. **Teste fechado (contas pessoais criadas depois de nov/2023):** é preciso ter pelo menos 12 testadores inscritos por 14 dias seguidos antes de pedir acesso à produção.
7. **Produção:** em Painel → Solicitar acesso à produção, responda o questionário e, depois de aprovado, promova a versão.

Para os envios seguintes:

```
npx eas-cli build -p android --profile production --auto-submit
```

O `--auto-submit` exige uma chave de conta de serviço do Google Cloud com acesso ao Play Console, configurada no `eas.json` ou enviada pelo `eas credentials`.

## Atenção: direitos das letras

Os direitos da Harpa Cristã pertencem à CPAD. O Google pode remover o app se houver denúncia de violação de direitos autorais. Antes de publicar, vale pedir autorização à CPAD ou confirmar que as letras usadas estão liberadas.
