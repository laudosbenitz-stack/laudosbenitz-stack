const user = JSON.parse(localStorage.getItem('usuario'));
if (!user) window.location.href = 'login.html';

document.getElementById('userName').innerText = user.login;
const nivelEl = document.getElementById('userNivel');
if (nivelEl) nivelEl.innerText = user.nivel;

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
Quagga.onDetected(async (data) => {
    const codigo = data.codeResult.code;

    Quagga.stop();
    document.getElementById("camera-overlay").style.display = "none";

    try {
        // 1️⃣ Buscar produto pelo código de barras
        const response = await fetch(`https://estoque-laudos.onrender.com/estoque/produto/${codigo}`);

        if (!response.ok) {
            alert("Produto não encontrado!");
            return;
        }

        const produto = await response.json();

        let quantidadeSaida;

        if (produto.unidade.toUpperCase() === "UN") {
            quantidadeSaida = 1;
        } else {
            const peso = prompt(`Produto: ${produto.nome}\nDigite o peso (KG):`);
            if (!peso) return;
            quantidadeSaida = parseFloat(peso);
        }

        // 2️⃣ Registrar saída
        await registrarMovimentacao(produto.id, quantidadeSaida);

    } catch (erro) {
        console.error(erro);
        alert("Erro ao buscar produto.");
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
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

    const res = await fetch('https://estoque-laudos.onrender.com/estoque/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            produto_id: produtoId,
            quantidade: qtd,
            tipo: 'SAIDA',
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

function logout() { localStorage.clear(); window.location.href = 'login.html'; }
carregarProdutos();