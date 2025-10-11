const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let couriers = {}; // Usamos um objeto para acesso mais rápido

// Endpoint para o PAINEL pedir os dados
app.get('/api/couriers/status', (req, res) => {
    // Converte o objeto de volta para um array para enviar ao frontend
    const activeCouriers = Object.values(couriers).filter(c => (Date.now() - c.lastUpdate) < 120000);
    console.log(`Enviando status de ${activeCouriers.length} entregadores para o painel.`);
    res.json(activeCouriers);
});

// Endpoint para o TRACKER enviar a sua localização
app.post('/api/update-location', (req, res) => {
    const { courierId, name, lat, lng, battery } = req.body;

    if (!courierId || !name || lat === undefined || lng === undefined) {
        return res.status(400).send('Dados inválidos.');
    }

    const now = Date.now();
    
    // Se o entregador já existe, atualiza os dados. Se não, cria um novo.
    couriers[courierId] = {
        ...couriers[courierId], // Mantém dados antigos como 'deliveries' se existirem
        id: courierId,
        name: name,
        lat: lat,
        lng: lng,
        battery: battery,
        status: "Em Entrega",
        lastUpdate: now
    };
    
    console.log(`Recebida atualização do Entregador ${name} (${courierId}).`);
    res.status(200).send('Localização recebida com sucesso.');
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor LogiPharma a funcionar em http://localhost:${PORT}`);
    console.log('A aguardar dados dos rastreadores...');
});