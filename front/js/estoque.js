const user = JSON.parse(localStorage.getItem('usuario'));
if (!user) window.location.href = 'login.html';

document.getElementById('userName').innerText = user.login;
document.getElementById('userNivel').innerText = user.nivel;

async function carregarProdutos() {
    const res = await fetch('https://estoque-laudos.onrender.com/estoque/produtos');
    const produtos = await res.json();
    const html = produtos.map(p => `
        <tr>
            <td>${p.nome}</td>
            <td>${p.quantidade} ${p.unidade}</td>
            <td>
                <button onclick="movimentar(${p.id}, 'ENTRADA')">+</button>
                <button onclick="movimentar(${p.id}, 'SAIDA')">-</button>
            </td>
        </tr>
    `).join('');
    document.getElementById('lista').innerHTML = html;
}

async function movimentar(id, tipo) {
    const qtd = prompt(`Quantidade para ${tipo}:`);
    if (!qtd) return;

    const res = await fetch('https://estoque-laudos.onrender.com/estoque/movimentar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({produto_id: id, tipo, quantidade: qtd, usuario_id: user.id})
    });
    
    const data = await res.json();
    if (data.success) carregarProdutos(); else alert(data.error);
}

    // 1. Função que liga a câmera
function abrirScanner() {
    document.getElementById("camera-overlay").style.display = "block";

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: document.querySelector('#camera'),
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["code_128_reader"]
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        Quagga.start();
    });
}
Quagga.onDetected(async function(result) {

    const codigoLido = result.codeResult.code;

    Quagga.stop();
    document.getElementById("camera-overlay").style.display = "none";

    try {

        // 1️⃣ Buscar produto pelo código
        const respostaProduto = await fetch(`/api/produtos/codigo/${codigoLido}`);

        if (!respostaProduto.ok) {
            alert("Produto não encontrado!");
            return;
        }

        const produto = await respostaProduto.json();

        // 2️⃣ Registrar movimentação (SEM enviar usuario_id)
        const respostaMov = await fetch("/api/movimentar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", // IMPORTANTE no Render
            body: JSON.stringify({
                produto_id: produto.id,
                tipo: "SAIDA",
                quantidade: 1
            })
        });

        const resultado = await respostaMov.json();

        if (!respostaMov.ok) {
            alert(resultado.msg || "Erro ao registrar");
            return;
        }

        alert("Produto registrado com sucesso!");

    } catch (erro) {
        console.error(erro);
        alert("Erro no sistema.");
    }

});
function fecharScanner() {
    Quagga.stop();
    document.getElementById("camera-overlay").style.display = "none";
}

    Quagga.onDetected(async (data) => {
        const codigo = data.codeResult.code;
        Quagga.stop(); 

        // Busca o produto (Rota que vamos criar no backend)
        const response = await fetch(`https://estoque-laudos.onrender.com/estoque/produto/${codigo}`);
        const produto = await response.json();

        if (!produto || produto.error) {
            alert("Produto não cadastrado!");
            Quagga.start();
            return;
        }

        let quantidadeSaida = 0;
        if (produto.unidade.toUpperCase() === 'UN') {
            quantidadeSaida = 1; // Registro direto para Unidade
        } else {
            const peso = prompt(`Produto: ${produto.nome}\nDigite o peso (KG):`);
            if (!peso) { Quagga.start(); return; }
            quantidadeSaida = parseFloat(peso);
        }

        // CHAMA A TERCEIRA FUNÇÃO AQUI
        registrarMovimentacao(produto.id, quantidadeSaida);
    });


// 2. A TERCEIRA FUNÇÃO (Onde você deve colar agora)
async function registrarMovimentacao(produtoId, qtd) {
    // Pega o ID do Matheus, Edilson, etc., que salvamos no login
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario')); 

    const res = await fetch('https://estoque-laudos.onrender.com/estoque/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            produto_id: produtoId,
            tipo: 'SAIDA',
            quantidade: qtd,
            usuario_id: usuarioLogado.id // Envia para o estoqueController
        })
    });

    if (res.ok) {
        alert("Saída registrada com sucesso!");
        window.location.reload(); // Limpa a tela para a próxima leitura
    } else {
        alert("Erro ao registrar saída.");
    }
}
// Exemplo de como pegar o ID do usuário que salvamos no login (LocalStorage)
const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

const dadosSaida = {
    produto_id: idDoProduto,
    quantidade: qtdSaida,
    tipo: 'SAIDA',
    usuario_id: usuarioLogado.id // Aqui o ID do Matheus, Edilson, etc.
};

function logout() { localStorage.clear(); window.location.href = 'login.html'; }
carregarProdutos();