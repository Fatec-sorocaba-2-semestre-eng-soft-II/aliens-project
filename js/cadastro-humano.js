
const formulario = document.getElementById('formCadastroHumano');

const campoIdade = document.getElementById('idade');
const campoDataNascimento = document.getElementById('dataNascimento');
const campoLocalAbducao = document.getElementById('localAbducao');
const campoLocalDevolucao = document.getElementById('localDevolucao');
const campoMesmoLocal = document.getElementById('mesmoLocal');
const campoNome = document.getElementById('nome');
const campoEndereco = document.getElementById('endereco');

// Limpa mensagens de validação quando o usuário altera os campos
[
    campoNome,
    campoEndereco,
    campoIdade,
    campoDataNascimento,
    campoLocalAbducao,
    campoLocalDevolucao
].forEach(campo => {
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
    campoNome.setCustomValidity('');
    campoEndereco.setCustomValidity('');
    campoLocalAbducao.setCustomValidity('');

    const idade = Number(campoIdade.value);
    const dataNascimento = campoDataNascimento.value;

    const localAbducao = campoLocalAbducao.value.trim();
    const localDevolucao = campoLocalDevolucao.value.trim();
    const mesmoLocal = campoMesmoLocal.checked;
    
    // Validação do nome
    if (campoNome.value.trim() === '') {
        campoNome.setCustomValidity('Informe o nome completo!');
        campoNome.reportValidity();
        return;
    }

    // Validação do endereço
    if (campoEndereco.value !== '' && campoEndereco.value.trim() === '') {
        campoEndereco.setCustomValidity('Informe um endereço válido!');
        campoEndereco.reportValidity();
        return;
    }

    // Validação do local de abdução
    if (localAbducao === '') {
        campoLocalAbducao.setCustomValidity('Informe o local de abdução!');
        campoLocalAbducao.reportValidity();
        return;
    }

    // Validação do local de devolução
    if (campoLocalDevolucao.value !== '' && localDevolucao === '') {
        campoLocalDevolucao.setCustomValidity('Informe um local de devolução válido!');
        campoLocalDevolucao.reportValidity();
        return;
    }

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
