
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ELEMENTOS DA PÁGINA
    // ==========================================

    const campoBusca = document.getElementById("busca");
    const tabela = document.getElementById("tb");
    const filtros = document.querySelectorAll(".filter-chip");

    // Verifica se os elementos necessários existem
    if (!tabela) {
        console.error("Tabela de naves não encontrada.");
        return;
    }

    const linhas = tabela.querySelectorAll("tbody tr");

    // Filtro inicialmente selecionado
    let filtroAtivo = "todas";


    // ==========================================
    // NORMALIZAÇÃO DE TEXTO
    // ==========================================

    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }


    // ==========================================
    // IDENTIFICAR STATUS DA NAVE
    // ==========================================

    function identificarStatus(linha) {

        // Permite utilizar data-status no HTML, caso exista
        if (linha.dataset.status) {
            return normalizarTexto(linha.dataset.status);
        }

        const texto = normalizarTexto(linha.textContent);

        if (
            texto.includes("manutencao") ||
            texto.includes("restricao")
        ) {
            return "manutencao";
        }

        if (
            texto.includes("em missao") ||
            texto.includes("missao")
        ) {
            return "missao";
        }

        if (
            texto.includes("operacional") ||
            texto.includes("disponivel")
        ) {
            return "operacional";
        }

        return "outro";
    }


    // ==========================================
    // APLICAR BUSCA E FILTROS
    // ==========================================

    function filtrarNaves() {

        const termoBusca = campoBusca
            ? normalizarTexto(campoBusca.value)
            : "";

        linhas.forEach(linha => {

            const textoLinha = normalizarTexto(
                linha.textContent
            );

            const status = identificarStatus(linha);

            // Verifica se corresponde à pesquisa
            const correspondeBusca =
                textoLinha.includes(termoBusca);

            // Verifica se corresponde ao filtro selecionado
            const correspondeFiltro =
                filtroAtivo === "todas" ||
                status === filtroAtivo;

            // Exibe ou oculta a linha
            if (correspondeBusca && correspondeFiltro) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }

        });

    }


    // ==========================================
    // CAMPO DE BUSCA
    // ==========================================

    if (campoBusca) {

        campoBusca.addEventListener("input", () => {
            filtrarNaves();
        });

    }


    // ==========================================
    // BOTÕES DE FILTRO
    // ==========================================

    filtros.forEach(botao => {

        botao.addEventListener("click", () => {

            // Identifica o filtro pelo atributo ou pelo texto
            const filtro = botao.dataset.filtro ||
                normalizarTexto(botao.textContent);

            if (filtro.includes("todas")) {
                filtroAtivo = "todas";

            } else if (filtro.includes("operacionais")) {
                filtroAtivo = "operacional";

            } else if (filtro.includes("missao")) {
                filtroAtivo = "missao";

            } else if (filtro.includes("manutencao")) {
                filtroAtivo = "manutencao";

            } else {
                return;
            }

            // Atualiza o botão visualmente selecionado
            filtros.forEach(item => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            botao.classList.add("active");
            botao.setAttribute("aria-pressed", "true");

            // Aplica o filtro
            filtrarNaves();

        });

    });


    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    filtrarNaves();

});