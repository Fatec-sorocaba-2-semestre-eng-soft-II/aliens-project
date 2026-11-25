
/* ==========================================
   AMS CENTRAL TÁTICA
   Ficha de Manutenção
========================================== */


/* ==========================================
   1. IMPRESSÃO DA FICHA
========================================== */

const botaoImprimir = document.getElementById("btn-imprimir");

botaoImprimir.addEventListener("click", function () {
    window.print();
});


/* ==========================================
   2. CONTROLE DOS ITENS DE INSPEÇÃO
========================================== */

const listaInspecao = document.getElementById("lista-inspecao");

const contadorConformes = document.getElementById("contador-conformes");


function atualizarContador() {

    const itens = listaInspecao.querySelectorAll("li");

    const totalItens = itens.length;

    const itensConformes = listaInspecao.querySelectorAll(
        'li[data-conforme="true"]'
    ).length;

    contadorConformes.textContent =
        `${itensConformes}/${totalItens} Conformes`;

}


/* ==========================================
   3. VERIFICAÇÃO DA VALIDADE
========================================== */

function verificarValidade() {

    const campoValidade = document.getElementById(
        "validade-homologacao"
    );

    // Data final da homologação
    const dataValidade = new Date(2026, 8, 15);

    // Data atual
    const hoje = new Date();

    // Remove as horas para comparar somente as datas
    hoje.setHours(0, 0, 0, 0);
    dataValidade.setHours(0, 0, 0, 0);

    // Calcula a diferença entre as datas
    const diferenca = dataValidade - hoje;

    const diasRestantes = Math.ceil(
        diferenca / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes < 0) {

        campoValidade.textContent = "Homologação vencida";

        campoValidade.classList.remove("green");

        campoValidade.classList.add("expired");

    } else if (diasRestantes === 0) {

        campoValidade.textContent = "Vence hoje";

        campoValidade.classList.remove("green");

        campoValidade.classList.add("warning");

    } else {

        campoValidade.textContent =
            `${diasRestantes} dias restantes`;

        campoValidade.classList.remove("expired", "warning");

        campoValidade.classList.add("green");

    }

}


/* ==========================================
   4. INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    atualizarContador();

    verificarValidade();

});