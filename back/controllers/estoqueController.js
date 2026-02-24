const db = require('../config/db');

exports.listarProdutos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM produtos');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.movimentar = async (req, res) => {
    const { produto_id, tipo, quantidade, usuario_id } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [prod] = await conn.query('SELECT quantidade FROM produtos WHERE id = ?', [produto_id]);
        
        if (tipo === 'SAIDA' && prod[0].quantidade < quantidade) {
            return res.status(400).json({msg: "Estoque insuficiente!"});
        }

        const operador = tipo === 'ENTRADA' ? '+' : '-';
        await conn.query(`UPDATE produtos SET quantidade = quantidade ${operador} ? WHERE id = ?`, [quantidade, produto_id]);
        await conn.query('INSERT INTO movimentacoes (tipo, quantidade, usuario_id, produto_id) VALUES (?,?,?,?)', [tipo, quantidade, usuario_id, produto_id]);
        
        await conn.commit();
        res.json({msg: "Sucesso!"});
    } catch (err) {
        await conn.rollback();
        res.status(500).json({error: err.message});
    } finally { conn.release(); }
};
// No back/controllers/estoqueController.js
exports.buscarPorCodigo = async (req, res) => {
    const { codigo } = req.params;
    try {
        const [rows] = await db.query('SELECT id, nome, unidade FROM produtos WHERE codigo_barras = ?', [codigo]);
        if (rows.length === 0) return res.status(404).json({ error: "Não encontrado" });
        res.json(rows[0]); // Retorna só ID, Nome e Unidade (sem a quantidade!)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};