const humanos = [
    {
        id: "HUMAN-001",
        nome: "Alex Morgan",
        localizacao: "América do Norte",
        historico: "Abduzido em 12/03/2025",
        status: "Monitorado"
    },
    {
        id: "HUMAN-002",
        nome: "Laura Bennett",
        localizacao: "Europa",
        historico: "Abduzida em 08/07/2024",
        status: "Devolvido"
    },
    {
        id: "HUMAN-003",
        nome: "Daniel Carter",
        localizacao: "América do Sul",
        historico: "Abduzido em 21/09/2025",
        status: "Em observação"
    },
    {
        id: "HUMAN-004",
        nome: "Emily Wilson",
        localizacao: "Ásia",
        historico: "Abduzida em 15/01/2026",
        status: "Monitorado"
    }
];

function listarHumanos(lista) {
    const tabela = document.getElementById("listaHumanos");
    const total = document.getElementById("totalHumanos");

    tabela.innerHTML = "";

    total.textContent = `${lista.length} humanos encontrados`;

    lista.forEach((humano) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>
                <strong>${humano.id}</strong><br>
                ${humano.nome}
            </td>
            <td>${humano.localizacao}</td>
            <td>${humano.historico}</td>
            <td>${humano.status}</td>
            <td>—</td>
        `;

        tabela.appendChild(linha);
    });

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhum humano encontrado.</td>
            </tr>
        `;
    }
}

listarHumanos(humanos);

const campoPesquisa = document.getElementById("pesquisaHumano");

campoPesquisa.addEventListener("input", () => {
    const pesquisa = campoPesquisa.value.toLowerCase();

    const humanosFiltrados = humanos.filter((humano) => {
        return (
            humano.id.toLowerCase().includes(pesquisa) ||
            humano.nome.toLowerCase().includes(pesquisa) ||
            humano.localizacao.toLowerCase().includes(pesquisa)
        );
    });

    listarHumanos(humanosFiltrados);
});