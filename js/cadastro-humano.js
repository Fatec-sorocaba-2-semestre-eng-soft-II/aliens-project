
const formulario = document.getElementById('formCadastroHumano');

const campoIdade = document.getElementById('idade');
const campoDataNascimento = document.getElementById('dataNascimento');
const campoLocalAbducao = document.getElementById('localAbducao');
const campoLocalDevolucao = document.getElementById('localDevolucao');
const campoMesmoLocal = document.getElementById('mesmoLocal');

// Limpa mensagens de validação quando o usuário altera os campos
[campoIdade, campoDataNascimento, campoLocalDevolucao].forEach(campo => {
    campo.addEventListener('input', function() {
        campo.setCustomValidity('');
    });
});

formulario.addEventListener('submit', function(event) {

    event.preventDefault();

    // Limpa mensagens anteriores
    campoIdade.setCustomValidity('');
    campoDataNascimento.setCustomValidity('');
    campoLocalDevolucao.setCustomValidity('');

    const idade = Number(campoIdade.value);
    const dataNascimento = campoDataNascimento.value;

    const localAbducao = campoLocalAbducao.value.trim();
    const localDevolucao = campoLocalDevolucao.value.trim();
    const mesmoLocal = campoMesmoLocal.checked;

    // Validação da idade
    if (!Number.isInteger(idade) || idade < 0) {
        campoIdade.setCustomValidity('Informe uma idade inteira e válida!');
        campoIdade.reportValidity();
        return;
    }

    // Cálculo da idade pela data de nascimento
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);

    const hoje = new Date();

    // Impede datas de nascimento futuras
    if (new Date(ano, mes - 1, dia) > hoje) {
        campoDataNascimento.setCustomValidity(
            'A data de nascimento não pode ser futura!'
        );
        campoDataNascimento.reportValidity();
        return;
    }

    let idadeCalculada = hoje.getFullYear() - ano;

    if (
        hoje.getMonth() + 1 < mes ||
        (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)
    ) {
        idadeCalculada--;
    }

    // Compara a idade informada com a calculada
    if (idade !== idadeCalculada) {
        campoIdade.setCustomValidity(
            'A idade não corresponde à data de nascimento!'
        );
        campoIdade.reportValidity();
        return;
    }

    // Validação do local de devolução
    if (!mesmoLocal && localDevolucao === '') {
        campoLocalDevolucao.setCustomValidity(
            'Informe o local de devolução!'
        );
        campoLocalDevolucao.reportValidity();
        return;
    }

    // Compara os locais quando o checkbox está selecionado
    if (mesmoLocal && localDevolucao !== '') {

        const localAlfa = localAbducao
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase();

        const localOmega = localDevolucao
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase();

        if (localAlfa !== localOmega) {
            campoLocalDevolucao.setCustomValidity(
                'O local de devolução é diferente do local de abdução!'
            );
            campoLocalDevolucao.reportValidity();
            return;
        }
    }

    console.log('Formulário enviado!');

});
