import json

# Carrega o arquivo original
with open("hinos_original.json", "r", encoding="utf-8") as f:
    dados_originais = json.load(f)

# Remove as informações do autor (chave "-1") se existir
if "-1" in dados_originais:
    del dados_originais["-1"]

# Converte para o formato do app
hinos_convertidos = []
for numero, conteudo in dados_originais.items():
    # Pega o título (ex: "1 - Chuvas de Graça")
    titulo_completo = conteudo.get("hino", "")
    # Remove o número do início se existir (ex: "1 - " → "Chuvas de Graça")
    if titulo_completo and titulo_completo[0].isdigit():
        titulo = (
            titulo_completo.split(" - ", 1)[-1]
            if " - " in titulo_completo
            else titulo_completo
        )
    else:
        titulo = titulo_completo

    # Pega os versos e junta em uma única string
    versos = conteudo.get("verses", {})
    letra = ""
    for verso_num, texto in versos.items():
        # Adiciona quebra de linha entre versos
        if letra:
            letra += "\n\n"
        letra += texto

    # Adiciona o coro (refrão) se existir
    coro = conteudo.get("coro", "")
    if coro:
        if letra:
            letra += "\n\n" + coro
        else:
            letra = coro

    hinos_convertidos.append(
        {"id": int(numero), "numero": int(numero), "titulo": titulo, "letra": letra}
    )

# Salva no formato do app
with open("hinos.json", "w", encoding="utf-8") as f:
    json.dump(hinos_convertidos, f, ensure_ascii=False, indent=2)

print(f"Convertidos {len(hinos_convertidos)} hinos com sucesso!")
