const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000; // O Render usa a variável de ambiente PORT

app.use(cors());
app.use(express.json());

let couriers = {}; // Usamos um objeto para acesso mais rápido

// Endpoint para o PAINEL pedir os dados
app.get('/api/couriers/status', (req, res) => {
    // Adiciona uma propriedade 'isActive' a cada entregador
    const allCouriers = Object.values(couriers).map(c => {
        // Considera inativo se não houver atualização há mais de 2 minutos
        const isActive = (Date.now() - c.lastUpdate) < 120000;
        return { ...c, isActive };
    });
    console.log(`Enviando status de ${allCouriers.length} entregadores para o painel.`);
    res.json(allCouriers);
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
        ...couriers[courierId],
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

// NOVO Endpoint para REMOVER um entregador
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
    console.log('A aguardar dados dos rastreadores...');
});

