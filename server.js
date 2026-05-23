const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para que tu GitHub Pages se conecte sin bloqueos
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL usando tu URL externa
const pool = new Pool({
    connectionString: "postgresql://isaias_admin:uAq6LVuXUoFv3dggpamPgnGtTQd2sQfn@dpg-d85k8a4vikkc73a19e00-a.oregon-postgres.render.com/metricas_db",
    ssl: {
        rejectUnauthorized: false // Requerido para conexiones seguras con Render
    }
});

// Endpoint GET: Obtener las métricas desde la tabla de la base de datos
app.get('/api/metrics', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, servidor_nombre, uso_cpu, uso_ram, disco_libre, fecha_registro FROM metricas_servidor ORDER BY fecha_registro DESC LIMIT 10;');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

// Endpoint POST: Por si en el futuro deseas registrar datos desde un script o formulario
app.post('/api/metrics', async (req, res) => {
    const { servidor_nombre, uso_cpu, uso_ram, disco_libre } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO metricas_servidor (servidor_nombre, uso_cpu, uso_ram, disco_libre) VALUES ($1, $2, $3, $4) RETURNING *;',
            [servidor_nombre, uso_cpu, uso_ram, disco_libre]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al insertar en la base de datos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});