const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors()); // Permite requisições de qualquer origem (frontend React pode acessar)
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'biblioteca',
    password: '30102005',
    port: 5432,
});

// Rota raiz só para teste
app.get('/', (req, res) => {
    res.send('API da Biblioteca funcionando!');
});

// Listar todos os livros com JOIN para pegar os nomes relacionados
app.get('/livros', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT 
                livro.id,
                livro.titulo,
                livro.ano_publicacao,
                autor.nome AS autor_nome,
                editora.nome AS editora_nome,
                tipo.nome AS tipo_nome
            FROM livro
            JOIN autor ON livro.autor_id = autor.id
            JOIN editora ON livro.editora_id = editora.id
            JOIN tipo ON livro.tipo_id = tipo.id
        `);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).send('Erro ao buscar livros');
    }
});

// Cadastrar novo livro
app.post('/livros', async (req, res) => {
    const { titulo, ano_publicacao, autor_id, tipo_id, editora_id } = req.body;

    if (!titulo || !autor_id || !tipo_id || !editora_id) {
        return res.status(400).send('Campos obrigatórios: titulo, autor_id, tipo_id, editora_id');
    }

    try {
        const resultado = await pool.query(
            'INSERT INTO livro (titulo, ano_publicacao, autor_id, tipo_id, editora_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [titulo, ano_publicacao, autor_id, tipo_id, editora_id]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao cadastrar livro:', error);
        res.status(500).send('Erro ao cadastrar livro');
    }
});

// Atualizar livro
app.put('/livros/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, ano_publicacao, autor_id, tipo_id, editora_id } = req.body;

    if (!titulo || !autor_id || !tipo_id || !editora_id) {
        return res.status(400).send('Campos obrigatórios: titulo, autor_id, tipo_id, editora_id');
    }

    try {
        const resultado = await pool.query(
            'UPDATE livro SET titulo = $1, ano_publicacao = $2, autor_id = $3, tipo_id = $4, editora_id = $5 WHERE id = $6 RETURNING *',
            [titulo, ano_publicacao, autor_id, tipo_id, editora_id, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send('Livro não encontrado');
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).send('Erro ao atualizar livro');
    }
});

// Deletar livro
app.delete('/livros/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            'DELETE FROM livro WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send('Livro não encontrado');
        }

        res.send(`Livro com id ${id} deletado com sucesso.`);
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        res.status(500).send('Erro ao deletar livro');
    }
});

// Rodar o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
