const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/estoque', estoqueRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
