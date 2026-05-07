import json
import re
from typing import Any, Dict, List


def transformar_hinos(arquivo_entrada: str, arquivo_saida: str) -> None:
    """
    Transforma hinos do formato antigo para o novo formato estruturado.

    Args:
        arquivo_entrada: Caminho do JSON original
        arquivo_saida: Caminho onde salvar o JSON transformado
    """
    # 1. Carregar dados originais
    with open(arquivo_entrada, "r", encoding="utf-8") as f:
        dados_originais = json.load(f)

    hinos_transformados = []

    # 2. Processar cada hino (ordenado por número)
    for chave, hino_original in sorted(
        dados_originais.items(), key=lambda x: int(x[0])
    ):
        try:
            hino_novo = processar_hino(int(chave), hino_original)
            hinos_transformados.append(hino_novo)
        except Exception as e:
            print(f"⚠️ Erro ao processar hino {chave}: {e}")
            continue

    # 3. Salvar resultado
    with open(arquivo_saida, "w", encoding="utf-8") as f:
        json.dump(hinos_transformados, f, ensure_ascii=False, indent=2)

    print(f"✅ Transformados {len(hinos_transformados)} hinos com sucesso!")


def processar_hino(id_hino: int, hino_original: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforma um hino individual.
    """
    # Extrair título (formato "número - Título")
    hino_str = hino_original["hino"]
    # Exemplo: "1 - Chuvas de Graça" → "Chuvas de Graça"
    titulo = hino_str.split(" - ", 1)[1] if " - " in hino_str else hino_str

    # Construir a letra completa
    letra = montar_letra(
        verses=hino_original.get("verses", {}), coro=hino_original.get("coro", "")
    )

    return {"id": id_hino, "numero": id_hino, "titulo": titulo.strip(), "letra": letra}


def montar_letra(verses: Dict[str, str], coro: str = "") -> str:
    """
    Monta a letra no formato desejado.

    Regras:
    - Ordenar versos numericamente (1, 2, 3...)
    - <br> → \n
    - Coro (se existir) após verso 1, em **negrito**, com \n\n antes e depois
    - Versos separados por \n\n
    """
    if not verses:
        return ""

    # Ordenar os versos (garantir que 1, 2, 3... venham na ordem correta)
    versos_ordenados = sorted(verses.items(), key=lambda x: int(x[0]))

    blocos = []

    for i, (num_verso, texto_verso) in enumerate(versos_ordenados, start=1):
        # Converter <br> para \n
        verso_limpo = texto_verso.replace("<br>", "\n").strip()

        # Adicionar número do verso
        bloco = f"{i}\n{verso_limpo}"

        # Se é o primeiro verso E tem coro, adicionar coro em negrito
        if i == 1 and coro:
            coro_limpo = coro.replace("<br>", "\n").strip()
            # Garantir que o coro fique com linha em branco antes e depois
            bloco += f"\n\n**{coro_limpo}**"

        blocos.append(bloco)

    # Juntar blocos com \n\n entre versos
    letra = "\n\n".join(blocos)

    # Remover quebras de linha extras no final, se houver
    letra = letra.rstrip()

    return letra


def validar_transformacao(arquivo_saida: str) -> None:
    """
    Validação básica do arquivo gerado (opcional, mas recomendado).
    """
    with open(arquivo_saida, "r", encoding="utf-8") as f:
        dados = json.load(f)

    print(f"\n📊 Estatísticas da transformação:")
    print(f"  - Total de hinos: {len(dados)}")

    # Verificar primeiro e último hino
    if dados:
        print(f"  - Primeiro hino: {dados[0]['titulo']}")
        print(f"  - Último hino: {dados[-1]['titulo']}")

        # Exemplo de like do primeiro hino
        print(f"\n📝 Exemplo do hino 1:\n")
        print(f"Título: {dados[0]['titulo']}")
        print(f"Letra (primeiros 200 chars):\n{dados[0]['letra'][:200]}...")


if __name__ == "__main__":
    # Executar transformação
    arquivo_entrada = "hinos_originais.json"  # Ajuste para seu arquivo
    arquivo_saida = "hinos_transformados.json"

    transformar_hinos(arquivo_entrada, arquivo_saida)
    validar_transformacao(arquivo_saida)
