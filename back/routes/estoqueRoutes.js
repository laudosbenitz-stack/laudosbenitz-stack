const db = require('../config/db');

const express = require('express');
const router = express.Router();
const estqCtrl = require('../controllers/estoqueController');
router.get('/produtos', estqCtrl.listarProdutos);
router.post('/movimentar', estqCtrl.movimentar);
router.get('/produto/:codigo', estqCtrl.buscarPorCodigo);
router.get('/saidas', estqCtrl.listarSaidas);
module.exports = router;

exports.registrarMovimentacao = async (req, res) => {
    const { tipo, quantidade, usuario_id, produto_id } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar estoque para saída
        if (tipo === 'SAIDA') {
            const [prod] = await connection.query('SELECT quantidade FROM produtos WHERE id = ?', [produto_id]);
            if (prod[0].quantidade < quantidade) {
                return res.status(400).json({ error: 'Estoque insuficiente' });
            }
            await connection.query('UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?', [quantidade, produto_id]);
        } else {
            await connection.query('UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?', [quantidade, produto_id]);
        }

        await connection.query('INSERT INTO movimentacoes (tipo, quantidade, usuario_id, produto_id) VALUES (?,?,?,?)', 
        [tipo, quantidade, usuario_id, produto_id]);

        await connection.commit();
        res.json({ message: 'Movimentação realizada com sucesso' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
    
};