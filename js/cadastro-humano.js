const formulario = document.getElementById('formCadastroHumano');

formulario.addEventListener('submit', function(event) {

    event.preventDefault();

    const idade = Number(document.getElementById('idade').value);
    const dataNascimento = document.getElementById('dataNascimento').value;

    const localAbducao = document.getElementById('localAbducao').value.trim();
    const localDevolucao = document.getElementById('localDevolucao').value.trim();
    const mesmoLocal = document.getElementById('mesmoLocal').checked;

    // Validação da idade
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);

    const hoje = new Date();

    let idadeCalculada = hoje.getFullYear() - ano;

    if (
        hoje.getMonth() + 1 < mes ||
        (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)
    ) {
        idadeCalculada--;
    }

    if (idade !== idadeCalculada) {
        alert('A idade informada não corresponde à data de nascimento!');
        return;
    }

    // Validação do local de devolução
    if (!mesmoLocal && localDevolucao === '') {
        alert('Informe o local de devolução!');
        return;
    }

    if (mesmoLocal && localDevolucao !== '') {

        if (localDevolucao.toLowerCase() !== localAbducao.toLowerCase()) {
            alert('O local de devolução é diferente do local de abdução!');
            return;
        }

    }

    console.log('Formulário enviado!');

});