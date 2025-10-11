const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- BASE DE DADOS EM MEMÓRIA ---
let couriers = {}; // Usamos um objeto para acesso rápido por ID

// --- ENDPOINTS DA API ---

// Endpoint para o PAINEL pedir os dados de todos os entregadores
app.get('/api/couriers/status', (req, res) => {
    const now = Date.now();
    const couriersList = Object.values(couriers).map(c => {
        const onlineTime = c.startTime ? Math.round((now - c.startTime) / 60000) : 0; // em minutos
        const isActive = (now - c.lastUpdate) < 120000; // Inativo após 2 minutos
        return { ...c, onlineTime, isActive };
    });
    res.json(couriersList);
});

// Endpoint para a PWA enviar a sua localização e status
app.post('/api/update-location', (req, res) => {
    const { id, name, lat, lng, battery, status, deliveries } = req.body;

    if (!id || !name) {
        return res.status(400).send('ID e Nome são obrigatórios.');
    }

    const now = Date.now();
    
    if (couriers[id]) {
        // Atualiza entregador existente
        couriers[id].lat = lat;
        couriers[id].lng = lng;
        couriers[id].battery = battery;
        couriers[id].status = status;
        couriers[id].deliveries = deliveries;
        couriers[id].lastUpdate = now;
    } else {
        // Adiciona novo entregador
        couriers[id] = {
            id,
            name,
            lat,
            lng,
            battery,
            status,
            deliveries,
            startTime: now,
            lastUpdate: now
        };
    }
    
    console.log(`Atualização: ${name} (ID: ${id}) - Status: ${status}, Entregas: ${deliveries}`);
    res.status(200).send('Dados recebidos.');
});

// Endpoint para remover um entregador
app.post('/api/couriers/remove/:id', (req, res) => {
    const { id } = req.params;
    if (couriers[id]) {
        delete couriers[id];
        console.log(`Entregador ${id} removido.`);
        res.status(200).send('Entregador removido.');
    } else {
        res.status(404).send('Entregador não encontrado.');
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor LogiPharma a funcionar na porta ${PORT}`);
});
