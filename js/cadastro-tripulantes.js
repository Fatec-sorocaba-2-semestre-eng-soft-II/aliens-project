
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTOS DO FORMULÁRIO
    // ==========================================

    const formulario = document.querySelector("form");
    const camposArquivo = formulario.querySelectorAll('input[type="file"]');

    // ==========================================
    // CONFIGURAÇÕES DOS ARQUIVOS
    // ==========================================

    const arquivosPermitidos = [
        {
            extensoes: [".holo", ".png", ".jpg"],
            tamanhoMaximo: 10 * 1024 * 1024,
            descricao: "Foto holográfica do tripulante"
        },
        {
            extensoes: [".pdf", ".doc", ".holo"],
            tamanhoMaximo: 25 * 1024 * 1024,
            descricao: "Certidão de competência tática"
        }
    ];

    // ==========================================
    // VALIDAÇÃO DOS ARQUIVOS
    // ==========================================

    function validarArquivos() {

        for (let i = 0; i < camposArquivo.length; i++) {

            const arquivo = camposArquivo[i].files[0];

            // Se nenhum arquivo foi selecionado, continua
            if (!arquivo) {
                continue;
            }

            const configuracao = arquivosPermitidos[i];
            const nomeArquivo = arquivo.name.toLowerCase();

            // Verifica a extensão
            const extensaoValida = configuracao.extensoes.some(
                extensao => nomeArquivo.endsWith(extensao)
            );

            if (!extensaoValida) {
                alert(
                    configuracao.descricao +
                    ": formato de arquivo não permitido.\n" +
                    "Formatos aceitos: " +
                    configuracao.extensoes.join(", ")
                );

                camposArquivo[i].value = "";
                return false;
            }

            // Verifica o tamanho
            if (arquivo.size > configuracao.tamanhoMaximo) {

                const limiteMB = configuracao.tamanhoMaximo / (1024 * 1024);

                alert(
                    configuracao.descricao +
                    ": o arquivo ultrapassa o limite de " +
                    limiteMB +
                    " MB."
                );

                camposArquivo[i].value = "";
                return false;
            }

        }

        return true;
    }

    // ==========================================
    // EVENTO DE ENVIO DO FORMULÁRIO
    // ==========================================

    formulario.addEventListener("submit", function (evento) {

        // Impede o envio imediato
        evento.preventDefault();

        // Verifica os arquivos selecionados
        if (!validarArquivos()) {
            return;
        }

        // Solicita confirmação do cadastro
        const confirmar = confirm(
            "Deseja confirmar o cadastro deste tripulante?"
        );

        if (confirmar) {

            alert("Cadastro de tripulante confirmado!");

            // Redireciona para a página de tripulação
            window.location.href = "tripulacao.html";

        }

    });

    // ==========================================
    // BOTÃO LIMPAR CAMPOS
    // ==========================================

    formulario.addEventListener("reset", function () {

        console.log("Campos do formulário foram limpos.");

    });

});