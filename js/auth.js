
// ========================================
// 1. VISUALIZAÇÃO DA SENHA
// ========================================

const campoSenha = document.getElementById("senha");
const botaoVisualizar = document.getElementById("togglePassword");

botaoVisualizar.addEventListener("click", function () {

    const senhaOculta = campoSenha.type === "password";

    campoSenha.type = senhaOculta ? "text" : "password";

    const icone = botaoVisualizar.querySelector("i");

    if (senhaOculta) {
        icone.classList.remove("fa-eye");
        icone.classList.add("fa-eye-slash");
        botaoVisualizar.setAttribute("aria-label", "Ocultar senha");
    } else {
        icone.classList.remove("fa-eye-slash");
        icone.classList.add("fa-eye");
        botaoVisualizar.setAttribute("aria-label", "Mostrar senha");
    }

});


// ========================================
// 2. ARMAZENAMENTO DE USUÁRIOS
// ========================================

const CHAVE_USUARIOS = "amsUsuarios";

const usuariosArmazenados = localStorage.getItem(CHAVE_USUARIOS);

if (usuariosArmazenados === null) {

    const usuariosIniciais = [
        {
            id: 1,
            login: "CEO",
            senha: "1234",
            perfil: "CEO"
        }
    ];

    localStorage.setItem(
        CHAVE_USUARIOS,
        JSON.stringify(usuariosIniciais)
    );

}

// ========================================
// 3. PERMISSÕES POR PERFIL
// ========================================

const permissoes = {

    CEO: [
        "gerenciarFrotas",
        "removerComandantes",
        "removerNaves",
        "gerenciarMissoes",
        "cadastrarTripulantes",
        "cadastrarHumanos",
        "gerenciarPesquisas",
        "gerarRelatoriosPesquisa",
        "gerenciarRotas",
        "gerarRelatoriosNaves",
        "atualizarSituacaoNave"
    ],

    Comandante: [
        "gerenciarMissoes",
        "cadastrarTripulantes",
        "cadastrarHumanos",
        "atualizarSituacaoNave"
    ],

    Cientista: [
        "gerenciarPesquisas",
        "gerarRelatoriosPesquisa"
    ],

    Piloto: [
        "gerenciarRotas",
        "gerarRelatoriosNaves",
        "atualizarSituacaoNave"
    ]

};

// ========================================
// 4. VERIFICAÇÃO DE PERMISSÕES
// ========================================

function usuarioTemPermissao(funcionalidade) {

    // Recupera o usuário autenticado
    const usuario = JSON.parse(
        sessionStorage.getItem("amsUsuarioAutenticado")
    );

    // Verifica se existe um usuário autenticado
    if (!usuario) {
        return false;
    }

    // Recupera as permissões do perfil
    const permissoesPerfil = permissoes[usuario.perfil];

    // Verifica se o perfil possui a funcionalidade solicitada
    return permissoesPerfil?.includes(funcionalidade) ?? false;

}

// ========================================
// 5. PROTEÇÃO DE ACESSO
// ========================================

function verificarAutenticacao(caminhoLogin = "login.html") {

    const usuario = JSON.parse(
        sessionStorage.getItem("amsUsuarioAutenticado")
    );

    if (!usuario) {

        window.location.href = caminhoLogin;

        return false;
    }

    return true;
}

// ========================================
// 6. PROTEÇÃO POR PERMISSÃO
// ========================================

function verificarPermissao(funcionalidade, caminhoLogin = "login.html") {

    // Primeiro verifica se o usuário está autenticado
    if (!verificarAutenticacao(caminhoLogin)) {
        return false;
    }

    // Verifica se o perfil possui a permissão solicitada
    if (!usuarioTemPermissao(funcionalidade)) {

        alert("Acesso negado! Você não possui permissão para acessar esta funcionalidade.");

        window.history.back();

        return false;
    }

    return true;
}


// ========================================
// 7. VALIDAÇÃO DO LOGIN
// ========================================

const formularioLogin = document.getElementById("loginForm");
const mensagemLogin = document.getElementById("loginMessage");

formularioLogin.addEventListener("submit", function (event) {

    // Impede o recarregamento da página
    event.preventDefault();

    // Captura os dados digitados
    const loginDigitado = document.getElementById("login").value.trim();
    const senhaDigitada = campoSenha.value;

    // Recupera os usuários armazenados
    const usuarios = JSON.parse(
        localStorage.getItem(CHAVE_USUARIOS)
    );

    // Procura um usuário com as credenciais informadas
    const usuarioEncontrado = usuarios.find(function (usuario) {

        return usuario.login.toLowerCase() === loginDigitado.toLowerCase()
            && usuario.senha === senhaDigitada;

    });

    // Verifica se encontrou o usuário
    if (usuarioEncontrado) {

        // Armazena os dados da sessão, sem salvar a senha
        const usuarioAutenticado = {
            id: usuarioEncontrado.id,
            login: usuarioEncontrado.login,
            perfil: usuarioEncontrado.perfil
        };

        sessionStorage.setItem(
            "amsUsuarioAutenticado",
            JSON.stringify(usuarioAutenticado)
        );

        mensagemLogin.textContent =
            `Acesso autorizado! Perfil: ${usuarioEncontrado.perfil}`;

        mensagemLogin.className = "login-message success";

        console.log("Usuário autenticado:", usuarioAutenticado);
        window.location.href = "visao-geral.html";
    } else {

        mensagemLogin.textContent =
            "Acesso negado! Usuário ou senha inválidos.";

        mensagemLogin.className = "login-message error";

    }

});

const usuarios = JSON.parse(localStorage.getItem("amsUsuarios"));

usuarios.push({
    id: 4,
    login: "PILOTO",
    senha: "1234",
    perfil: "Piloto"
});

localStorage.setItem("amsUsuarios", JSON.stringify(usuarios));