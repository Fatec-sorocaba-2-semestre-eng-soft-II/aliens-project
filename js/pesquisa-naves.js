
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTOS DA PÁGINA
    // ==========================================

    const statusNave = document.getElementById("status-nave");
    const descricaoStatus = document.getElementById("descricao-status");

    const seletorStatus = document.getElementById("alterar-status");
    const campoTripulantes = document.getElementById("tripulantes");

    const botaoSalvar = document.getElementById("salvar-alteracoes");

    const buscaMissao = document.getElementById("busca-missao");
    const filtroMissao = document.getElementById("filtro-missao");

    const tabelaMissoes = document.getElementById("historico-missoes");
    const contadorMissoes = document.getElementById("contador-missoes");

    const quantidadeTripulantes = document.getElementById("quantidade-tripulantes");

    // ==========================================
    // CONFIGURAÇÕES DE STATUS
    // ==========================================

    const configuracoesStatus = {

        disponivel: {
            texto: "● Disponível // Habilitada para missão",
            descricao: "Telemetria e prontidão operacional validadas para novo despacho estelar.",
            classe: "pill ok"
        },

        missao: {
            texto: "● Em missão // Operação em andamento",
            descricao: "Nave atualmente vinculada a uma operação tática.",
            classe: "pill pending"
        },

        manutencao: {
            texto: "● Em manutenção // Operação suspensa",
            descricao: "Nave indisponível até a conclusão dos procedimentos de manutenção.",
            classe: "pill pending"
        },

        restricao: {
            texto: "● Com restrição // Uso limitado",
            descricao: "Nave apresenta restrições operacionais e depende de autorização do comando.",
            classe: "pill off"
        }

    };

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
    // ATUALIZAÇÃO DO STATUS DA NAVE
    // ==========================================

    function atualizarStatus(status) {

        const configuracao = configuracoesStatus[status];

        if (!configuracao) {
            return;
        }

        statusNave.textContent = configuracao.texto;
        statusNave.className = configuracao.classe;

        descricaoStatus.textContent = configuracao.descricao;

    }

    // ==========================================
    // ATUALIZAÇÃO DA QUANTIDADE DE TRIPULANTES
    // ==========================================

    function atualizarTripulantes() {

        const quantidade = Number(campoTripulantes.value);

        if (
            !Number.isInteger(quantidade) ||
            quantidade < 0 ||
            quantidade > 12
        ) {

            alert("Informe uma quantidade entre 0 e 12 tripulantes.");

            campoTripulantes.value = 0;
            quantidadeTripulantes.textContent = "Sem tripulantes";

            return false;

        }

        if (quantidade === 0) {

            quantidadeTripulantes.textContent = "Sem tripulantes";
            quantidadeTripulantes.className = "amber";

        } else {

            quantidadeTripulantes.textContent =
                quantidade + (quantidade === 1 ? " tripulante" : " tripulantes");

            quantidadeTripulantes.className = "green";

        }

        return true;

    }

    // ==========================================
    // SALVAR ALTERAÇÕES
    // ==========================================

    botaoSalvar.addEventListener("click", function () {

        const statusSelecionado = seletorStatus.value;

        const quantidade = Number(campoTripulantes.value);

        // Validação da quantidade de tripulantes
        if (
            !Number.isInteger(quantidade) ||
            quantidade < 0 ||
            quantidade > 12
        ) {

            alert("A quantidade de tripulantes deve estar entre 0 e 12.");
            campoTripulantes.focus();

            return;

        }

        // Atualiza o status da nave
        atualizarStatus(statusSelecionado);

        // Atualiza a quantidade de tripulantes
        atualizarTripulantes();

        // Confirmação visual
        alert("Alterações da nave atualizadas com sucesso!");

    });

    // ==========================================
    // PESQUISA E FILTRO DO HISTÓRICO DE MISSÕES
    // ==========================================

    function filtrarMissoes() {

        const termo = normalizarTexto(buscaMissao.value);
        const statusSelecionado = filtroMissao.value;

        const linhas = tabelaMissoes.querySelectorAll("tr");

        let quantidadeVisivel = 0;

        linhas.forEach(function (linha) {

            const texto = normalizarTexto(linha.textContent);
            const status = linha.dataset.status;

            // Pesquisa pelo conteúdo da linha
            const correspondePesquisa = texto.includes(termo);

            // Filtro pelo status
            const correspondeStatus =
                statusSelecionado === "todos" ||
                status === statusSelecionado;

            // Combina os filtros
            const exibir =
                correspondePesquisa && correspondeStatus;

            linha.style.display = exibir ? "" : "none";

            if (exibir) {
                quantidadeVisivel++;
            }

        });

        contadorMissoes.textContent =
            `Exibindo ${quantidadeVisivel} missões`;

    }

    // Evento de pesquisa
    buscaMissao.addEventListener("input", filtrarMissoes);

    // Evento de filtro
    filtroMissao.addEventListener("change", filtrarMissoes);

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    function inicializarPagina() {

        // Define a situação inicial
        atualizarStatus(seletorStatus.value);

        // Atualiza a quantidade inicial
        atualizarTripulantes();

        // Atualiza o histórico
        filtrarMissoes();

    }

    inicializarPagina();

});