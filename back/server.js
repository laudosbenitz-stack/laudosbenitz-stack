const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ROTAS PRIMEIRO
app.use('/auth', authRoutes);
app.use('/estoque', estoqueRoutes);

// Static
app.use(express.static(path.resolve(__dirname, '..', 'front')));

// Catch-all POR ÚLTIMO
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'front', 'login.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});