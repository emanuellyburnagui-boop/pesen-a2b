// Lista gerada dinamicamente com 36 alunos para poupar espaço no código fonte
const nomesExemplo = [
    "Ana Silva", "Bruno Santos", "Carlos Lima", "Diana Costa", "Eduardo Souza",
    "Fernanda Oliveira", "Gabriel Rodrigues", "Helena Almeida", "Igor Pereira", "Julia Carvalho",
    "Kevin Ribeiro", "Larissa Fernandes", "Matheus Gomes", "Nathalia Martins", "Otávio Araújo",
    "Patrícia Melo", "Queren Hapuque", "Rafael Castro", "Sabrina Barbosa", "Thiago Rocha",
    "Úrsula Mendes", "Vitor Correia", "Wesley Cardoso", "Xavier Teixeira", "Yasmin Nunes",
    "Zeca Pinto", "Arthur Moraes", "Beatriz Farias", "Caio Antunes", "Davina Lopes",
    "Erick Vieira", "Gabriela Machado", "Heitor Marques", "Isabela Ramos", "João Pedro", "Laura Lima"
];

const alunosIniciais = nomesExemplo.map((nome, index) => {
    const numeroChamada = String(index + 1).padStart(2, '0');
    return { id: numeroChamada, nome: nome, horario: "--:--", presente: false };
});

// Carrega os dados salvos no navegador ou usa a estrutura com os 36 alunos
let listaAlunos = JSON.parse(localStorage.getItem('chamadaAlunos')) || alunosIniciais;

const corpoTabela = document.getElementById('corpoTabela');
const buscaInput = document.getElementById('buscaAluno');

// Função para exibir os dados na tela
function renderizarTabela(filtro = '') {
    corpoTabela.innerHTML = '';

    listaAlunos.forEach((aluno) => {
        if (!aluno.nome.toLowerCase().includes(filtro.toLowerCase())) {
            return;
        }

        const linha = document.createElement('tr');
        const classeStatus = aluno.presente ? 'status presente' : 'status ausente';
        const textoStatus = aluno.presente ? 'Presente' : 'Ausente';

        // Descobre o índice real na lista global para passar à função de clique
        const indiceReal = listaAlunos.findIndex(a => a.id === aluno.id);

        linha.innerHTML = `
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.horario}</td>
            <td><button class="${classeStatus}" onclick="alternarPresenca(${indiceReal})">${textoStatus}</button></td>
        `;

        corpoTabela.appendChild(linha);
    });
}

// Alternar entre Presente e Ausente
window.alternarPresenca = function(index) {
    listaAlunos[index].presente = !listaAlunos[index].presente;

    if (listaAlunos[index].presente) {
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        listaAlunos[index].horario = `${horas}:${minutos}`;
    } else {
        listaAlunos[index].horario = "--:--";
    }

    localStorage.setItem('chamadaAlunos', JSON.stringify(listaAlunos));
    renderizarTabela(buscaInput.value);
};

// Gerador e configurador do arquivo PDF
window.exportarParaPDF = function() {
    const elemento = document.getElementById('conteudoImpressao');
    
    // Adiciona uma classe temporária para otimizar o visual dos botões no papel/PDF
    elemento.classList.add('modo-impressao');

    // Configurações do arquivo PDF final
    const opcoes = {
        margin:       10,
        filename:     'lista_de_chamada.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Executa a exportação e remove a classe temporária logo em seguida
    html2pdf().set(opcoes).from(elemento).save().then(() => {
        elemento.classList.remove('modo-impressao');
    });
};

// Filtro de digitação
buscaInput.addEventListener('input', () => {
    renderizarTabela(buscaInput.value);
});

// Inicialização
renderizarTabela();

