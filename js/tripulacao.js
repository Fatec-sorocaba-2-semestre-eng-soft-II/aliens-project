
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTOS PRINCIPAIS
    // ==========================================

    const busca = document.getElementById("busca");
    const selectStatus = document.getElementById("status");
    const filtrosCargo = document.querySelectorAll(".chip");
    const tabela = document.getElementById("tb");
    const linhas = tabela.querySelectorAll("tr");
    const contador = document.getElementById("contador-registros");

    const modalConfirmacao = document.getElementById("m1");
    const modalSucesso = document.getElementById("m2");

    const botaoConfirmar = document.getElementById("confirma");
    const campoZulu = document.getElementById("zulu");

    // ==========================================
    // VARIÁVEIS DE CONTROLE
    // ==========================================

    let cargoSelecionado = "todos";
    let tripulanteSelecionado = null;

    const totalRegistros = 48;

    // ==========================================
    // FUNÇÃO DE NORMALIZAÇÃO DE TEXTO
    // ==========================================

    function normalizarTexto(texto) {

        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    }

    // ==========================================
    // PESQUISA E FILTROS
    // ==========================================

    function filtrarTripulantes() {

        const termoPesquisa = normalizarTexto(busca.value);
        const statusSelecionado = selectStatus.value;

        let quantidadeVisivel = 0;

        linhas.forEach(function (linha) {

            const textoLinha = normalizarTexto(linha.textContent);

            const cargoLinha = linha.dataset.role;
            const statusLinha = linha.dataset.status;

            // Verifica o texto pesquisado
            const correspondePesquisa =
                textoLinha.includes(termoPesquisa);

            // Verifica o cargo selecionado
            const correspondeCargo =
                cargoSelecionado === "todos" ||
                cargoLinha === cargoSelecionado;

            // Verifica o status selecionado
            const correspondeStatus =
                statusSelecionado === "todos" ||
                statusLinha === statusSelecionado;

            // Combina todos os filtros
            const exibir =
                correspondePesquisa &&
                correspondeCargo &&
                correspondeStatus;

            linha.style.display = exibir ? "" : "none";

            if (exibir) {
                quantidadeVisivel++;
            }

        });

        // Atualiza o contador de registros
        contador.textContent =
            `Exibindo ${quantidadeVisivel} de ${totalRegistros} registros biométricos`;

    }

    // Pesquisa enquanto o usuário digita
    busca.addEventListener("input", filtrarTripulantes);

    // Filtro por status
    selectStatus.addEventListener("change", filtrarTripulantes);

    // Filtro por cargo
    filtrosCargo.forEach(function (botao) {

        botao.addEventListener("click", function () {

            // Remove a classe active de todos os filtros
            filtrosCargo.forEach(function (filtro) {
                filtro.classList.remove("active");
            });

            // Ativa o filtro selecionado
            botao.classList.add("active");

            // Atualiza o cargo selecionado
            cargoSelecionado = botao.dataset.r;

            filtrarTripulantes();

        });

    });

    // ==========================================
    // ABRIR MODAL DE CONFIRMAÇÃO
    // ==========================================

    const botoesBloqueio = document.querySelectorAll("[data-block]");

    botoesBloqueio.forEach(function (botao) {

        botao.addEventListener("click", function () {

            // Recupera as informações do atributo data-block
            const dados = botao.dataset.block.split("|");

            const nome = dados[0];
            const identificador = dados[1];
            const hierarquia = dados[2];
            const designacao = dados[3];

            // Guarda a linha correspondente ao tripulante
            tripulanteSelecionado = botao.closest("tr");

            // Preenche os dados do modal de confirmação
            preencherDadosModal(nome, identificador, hierarquia, designacao);

            // Abre o modal
            modalConfirmacao.classList.add("open");

        });

    });

    // ==========================================
    // PREENCHER INFORMAÇÕES DOS MODAIS
    // ==========================================

    function preencherDadosModal(nome, identificador, hierarquia, designacao) {

        // Informações do modal de confirmação
        modalConfirmacao.querySelector(".f-n").textContent = nome;
        modalConfirmacao.querySelector(".f-i").textContent = identificador;
        modalConfirmacao.querySelector(".f-h").textContent = hierarquia;
        modalConfirmacao.querySelector(".f-d").textContent = designacao;

        // Informações do modal de sucesso
        modalSucesso.querySelector(".f-n").textContent = nome;
        modalSucesso.querySelector(".f-i").textContent = identificador;

    }

    // ==========================================
    // CONFIRMAR BLOQUEIO
    // ==========================================

    botaoConfirmar.addEventListener("click", function () {

        // Verifica se existe um tripulante selecionado
        if (!tripulanteSelecionado) {
            return;
        }

        // Atualiza o status do tripulante
        tripulanteSelecionado.dataset.status = "bloqueado";

        // Localiza o indicador de status
        const badge = tripulanteSelecionado.querySelector(".badge");

        if (badge) {

            badge.className = "badge off";
            badge.textContent = "Bloqueado";

        }

        // Remove o botão de bloqueio da linha
        const botaoBloqueio = tripulanteSelecionado.querySelector("[data-block]");

        if (botaoBloqueio) {
            botaoBloqueio.remove();
        }

        // Registra a data e hora em UTC
        const dataAtual = new Date();

        campoZulu.textContent =
            dataAtual.toISOString()
                .slice(0, 16)
                .replace("T", " · ") + " Z";

        // Fecha o modal de confirmação
        modalConfirmacao.classList.remove("open");

        // Abre o modal de sucesso
        modalSucesso.classList.add("open");

        // Atualiza os resultados da tabela
        filtrarTripulantes();

        // Limpa a seleção atual
        tripulanteSelecionado = null;

    });

    // ==========================================
    // FECHAR MODAIS
    // ==========================================

    const botoesFechar = document.querySelectorAll("[data-close]");

    botoesFechar.forEach(function (botao) {

        botao.addEventListener("click", function () {

            modalConfirmacao.classList.remove("open");
            modalSucesso.classList.remove("open");

            tripulanteSelecionado = null;

        });

    });

    // Fecha o modal ao clicar fora da janela
    [modalConfirmacao, modalSucesso].forEach(function (modal) {

        modal.addEventListener("click", function (evento) {

            if (evento.target === modal) {

                modal.classList.remove("open");
                tripulanteSelecionado = null;

            }

        });

    });

    // Fecha o modal ao pressionar ESC
    document.addEventListener("keydown", function (evento) {

        if (evento.key === "Escape") {

            modalConfirmacao.classList.remove("open");
            modalSucesso.classList.remove("open");

            tripulanteSelecionado = null;

        }

    });

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    filtrarTripulantes();

});