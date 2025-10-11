const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let couriers = {}; // Usamos um objeto para acesso mais rápido

// Endpoint para o PAINEL pedir os dados
app.get('/api/couriers/status', (req, res) => {
    const allCouriers = Object.values(couriers).map(c => {
        const isActive = (Date.now() - c.lastUpdate) < 120000; // 2 minutos de inatividade
        const onlineTime = Math.floor((Date.now() - c.startTime) / 60000); // Tempo online em minutos
        return { ...c, isActive, onlineTime };
    });
    res.json(allCouriers);
});

// Endpoint para o TRACKER enviar a sua localização
app.post('/api/update-location', (req, res) => {
    const { courierId, name, lat, lng, battery, status } = req.body;

    if (!courierId || !name || lat === undefined || lng === undefined) {
        return res.status(400).send('Dados inválidos.');
    }

    const now = Date.now();
    
    // Se o entregador é novo, define a sua hora de início
    if (!couriers[courierId]) {
        couriers[courierId] = { startTime: now };
    }

    // Atualiza os dados
    couriers[courierId] = {
        ...couriers[courierId],
        id: courierId,
        name: name,
        lat: lat,
        lng: lng,
        battery: battery,
        status: status || 'Em Entrega', // Usa o status enviado ou um padrão
        lastUpdate: now
    };
    
    console.log(`Recebida atualização do Entregador ${name} (${courierId}). Status: ${status}`);
    res.status(200).send('Localização recebida com sucesso.');
});

// Endpoint para REMOVER um entregador
app.post('/api/couriers/remove/:id', (req, res) => {
    const { id } = req.params;
    if (couriers[id]) {
        delete couriers[id];
        console.log(`Entregador ${id} removido.`);
        res.status(200).send({ message: 'Entregador removido com sucesso.' });
    } else {
        res.status(404).send({ message: 'Entregador não encontrado.' });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor LogiPharma a funcionar na porta ${PORT}`);
});

