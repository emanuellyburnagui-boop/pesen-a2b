// Lista gerada dinamicamente com 36 alunos
const nomesExemplo = [
    "Alicia Ribas", "André Max", "Anthony Cardoso", "Antonio Miguel", "Brayan Souza",
    "Brayan Vinicios", "Caio Gabriel", "Carlos Eduardo", "Daniel Jesus", "Emanuelly Burnagui",
    "Enzo Gabriel", "Gabriel Carlos", "Gilyane de Souza", "Guilherme Vieira", "Igor Boinovski",
    "João Victor de Jesus", "João Vitor Fragoso", "Julia Diniz", "Lucas Peppes", "Luiz Eduardo",
    "Mateus Camargo", "Matheus Henrique", "Nathaly borowski", "Natally Rafaela", "Nicolas Daniel",
    "Paulo Henrique", "Pedro de França", "Pedro Henrique Covaleski", "Pedro Henrique Lisboa", "Sabryna da Silva",
    "Samuel de Goes", "Savio Henrique", "Vinicius Kenji", "Willian Souza", "Yasmin Rodrigues", "Yngrid Paola"
];

const inputHorarioPadrao = document.getElementById('horarioPadrao');
const corpoTabela = document.getElementById('corpoTabela');
const corpoTabelaHorarios = document.getElementById('corpoTabelaHorarios');
const buscaInput = document.getElementById('buscaAluno');

// 1. TENTA CARREGAR OS DADOS SALVOS PRIMEIRO
let listaAlunos = JSON.parse(localStorage.getItem('chamadaAlunos'));

// 2. SE NÃO EXISTIR NADA SALVO, CRIA A LISTA INICIAL COM O HORÁRIO PADRÃO ATUAL
if (!listaAlunos || listaAlunos.length === 0) {
    const horarioPadraoInicial = inputHorarioPadrao ? inputHorarioPadrao.value : "08:00";
    listaAlunos = nomesExemplo.map((nome, index) => {
        const numeroChamada = String(index + 1).padStart(2, '0');
        return { id: numeroChamada, nome: nome, horario: horarioPadraoInicial, presente: false };
    });
    // Salva imediatamente a estrutura inicial para não dar conflito
    localStorage.setItem('chamadaAlunos', JSON.stringify(listaAlunos));
}

// Função auxiliar que valida se o horário programado do aluno expirou comparado ao relógio atual
function verificarSeEstaAtrasado(aluno) {
    if (aluno.presente) return false;

    const agora = new Date();
    const [horasAluno, minutosAluno] = aluno.horario.split(':').map(Number);
    
    const horaLimite = new Date();
    horaLimite.setHours(horasAluno, minutosAluno, 0, 0);

    return agora > horaLimite;
}

// Função para exibir e sincronizar os dados na tela em ambas as abas
function renderizarTabela() {
    const filtro = buscaInput.value.toLowerCase();

    // --- RENDERIZAÇÃO DA ABA 1: DIÁRIO DE CHAMADA PRINCIPAL ---
    corpoTabela.innerHTML = '';

    // Regra: Duplica a lista original e ordena colocando quem está atrasado no topo
    const listaAba1Ordenada = [...listaAlunos].sort((a, b) => {
        const atrasadoA = verificarSeEstaAtrasado(a);
        const atrasadoB = verificarSeEstaAtrasado(b);
        return atrasadoB - atrasadoA; 
    });

    listaAba1Ordenada.forEach((aluno) => {
        if (!aluno.nome.toLowerCase().includes(filtro)) {
            return;
        }

        const linha = document.createElement('tr');
        const estaAtrasado = verificarSeEstaAtrasado(aluno);

        if (estaAtrasado) {
            linha.classList.add('linha-atrasada');
        }

        const classeStatus = aluno.presente ? 'status presente' : 'status ausente';
        const textoStatus = aluno.presente ? 'Presente' : 'Ausente';
        
        // CORREÇÃO CRÍTICA: Busca pelo ID único e não por ordenação de tela para evitar trocar dados de alunos
        const indiceReal = listaAlunos.findIndex(a => a.id === aluno.id);

        linha.innerHTML = `
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td>
                <input type="time" class="input-hora-tabela" value="${aluno.horario}" onchange="atualizarHorarioIndividual(${indiceReal}, this.value)">
            </td>
            <td><button class="${classeStatus}" onclick="alternarPresenca(${indiceReal})">${textoStatus}</button></td>
        `;

        corpoTabela.appendChild(linha);
    });

    // --- RENDERIZAÇÃO DA ABA 2: LISTA POR ORDEM DE HORÁRIO ---
    corpoTabelaHorarios.innerHTML = '';

    const listaAba2Cronologica = [...listaAlunos].sort((a, b) => a.horario.localeCompare(b.horario));

    listaAba2Cronologica.forEach((aluno) => {
        if (!aluno.nome.toLowerCase().includes(filtro)) {
            return;
        }

        const linha = document.createElement('tr');
        if (verificarSeEstaAtrasado(aluno)) {
            linha.classList.add('linha-atrasada');
        }

        const textoStatus = aluno.presente ? 'Presente' : 'Ausente';

        linha.innerHTML = `
            <td><strong>${aluno.horario}</strong></td>
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td><span class="status ${aluno.presente ? 'presente' : 'ausente'}">${textoStatus}</span></td>
        `;

        corpoTabelaHorarios.appendChild(linha);
    });
}

// Evento disparado quando o usuário altera o horário global visual na tela
if (inputHorarioPadrao) {
    inputHorarioPadrao.addEventListener('change', (evento) => {
        const novoHorarioGlobal = evento.target.value;
        // Altera apenas os horários, mantendo o status de presença intacto
        listaAlunos.forEach(aluno => {
            aluno.horario = novoHorarioGlobal;
        });
        salvarDadosESincronizar();
    });
}

// Atualiza o horário de um único aluno diretamente pelo input presente na tabela
window.atualizarHorarioIndividual = function(index, novoHorario) {
    listaAlunos[index].horario = novoHorario;
    salvarDadosESincronizar();
};

// Alternar entre Presente e Ausente preservando o horário definido
window.alternarPresenca = function(index) {
    listaAlunos[index].presente = !listaAlunos[index].presente;
    salvarDadosESincronizar();
};

// Salva as alterações vigentes no LocalStorage e renderiza o conteúdo atualizado
function salvarDadosESincronizar() {
    localStorage.setItem('chamadaAlunos', JSON.stringify(listaAlunos));
    renderizarTabela();
}

// Gerencia a troca visual e estrutural das Abas
window.mudarAba = function(abaId) {
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
    document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('ativa'));

    document.getElementById(abaId).classList.add('ativa');
    
    if (abaId === 'aba-chamada') {
        document.getElementById('btn-aba-chamada').classList.add('ativa');
    } else {
        document.getElementById('btn-aba-horarios').classList.add('ativa');
    }
};

// Gerador e configurador do arquivo PDF unificado (imprime ambas as abas)
window.exportarParaPDF = function() {
    const elemento = document.getElementById('conteudoImpressao');
    elemento.classList.add('modo-impressao');

    const opcoes = {
        margin:       10,
        filename:     'lista_de_chamada_completa.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opcoes).from(elemento).save().then(() => {
        elemento.classList.remove('modo-impressao');
    });
};

// Filtro de digitação da barra de pesquisa
if (buscaInput) {
    buscaInput.addEventListener('input', renderizarTabela);
}

// Monitora o relógio do sistema a cada 15 segundos para atualizar os atrasados sem precisar recarregar
setInterval(renderizarTabela, 15000);

// Inicialização
renderizarTabela();
