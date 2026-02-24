const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../front'))); 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/login.html'));
});

app.use('/auth', authRoutes);
app.use('/estoque', estoqueRoutes);

const PORT = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, '../front')));
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
