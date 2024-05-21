const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const app = express();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'violations_db',
    password: '0000',
    port: 5432,
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
    const { name, phone, email, login, password } = req.body;
    try {
        await pool.query(
            'INSERT INTO users (name, phone, email, login, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, phone, email, login, password, 'user']
        );
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: 'Ошибка при регистрации' });
    }
});

app.post('/login', async (req, res) => {
    const { login, password } = req.body;
    try {
        const result = await pool.query('SELECT role FROM users WHERE login = $1 AND password = $2', [login, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, role: result.rows[0].role });
        } else {
            res.json({ success: false, message: 'Неверный логин или пароль' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Ошибка при авторизации' });
    }
});

app.post('/new_claim', async (req, res) => {
    const { carNumber, description } = req.body;
    try {
        await pool.query(
            'INSERT INTO claims (car_number, description, status) VALUES ($1, $2, $3) RETURNING id',
            [carNumber, description, 'new']
        );
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: 'Ошибка при создании заявления' });
    }
});

app.get('/claims', async (_, res) => {
    try {
        const result = await pool.query('SELECT * FROM claims');
        res.json({ claims: result.rows });
    } catch (err) {
        res.json({ success: false, message: 'Ошибка при загрузке заявлений' });
    }
});

app.get('/admin/claims', async (_, res) => {
    try {
        const result = await pool.query('SELECT * FROM claims');
        res.json({ claims: result.rows });
    } catch (err) {
        res.json({ success: false, message: 'Ошибка при загрузке заявлений' });
    }
});

app.post('/admin/update_claim', async (req, res) => {
    const { id, status } = req.body;
    try {
        await pool.query('UPDATE claims SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: 'Ошибка при обновлении статуса заявления' });
    }
});

app.listen(3000, () => console.log('Сервер запущен на порту 3000'));
