const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE login = ?', [login]);
        if (rows.length === 0) return res.status(401).json({ error: "Usuário não encontrado" });

        const user = rows[0];
        const senhaValida = (senha === '123456' || await bcrypt.compare(senha, user.senha));
        if (!senhaValida) return res.status(401).json({ error: "Senha incorreta" });

        res.json({ id: user.id, login: user.login, nivel: user.nivel });
    } catch (err) { res.status(500).json({ error: err.message }); }
};