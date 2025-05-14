const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let trafficLights = [];

// GET: lista todos os semáforos
app.get('/api/traffic-lights', (req, res) => {
  res.json(trafficLights);
});

// POST: adiciona vários semáforos de uma vez
app.post('/api/traffic-lights', (req, res) => {
  const newLights = req.body;
  trafficLights = [...trafficLights, ...newLights];
  res.status(201).json({ message: 'Semáforos adicionados com sucesso' });
});

// POST: reseta um grupo (ordem 1 = verde, resto = vermelho)
app.post('/api/reset-group/:group', (req, res) => {
  const group = parseInt(req.params.group);
  const groupLights = trafficLights.filter(t => t.group === group);

  if (groupLights.length === 0) {
    return res.status(404).json({ error: 'Grupo não encontrado' });
  }

  groupLights.forEach(t => {
    t.status = t.order === 1 ? 'green' : 'red';
  });

  res.json({ message: `Grupo ${group} resetado com sucesso` });
});

// DELETE: remove todos os semáforos de um grupo
app.delete('/api/delete-group/:group', (req, res) => {
  const group = parseInt(req.params.group);
  const initialLength = trafficLights.length;

  trafficLights = trafficLights.filter(t => t.group !== group);

  if (trafficLights.length === initialLength) {
    return res.status(404).json({ error: 'Grupo não encontrado' });
  }

  res.json({ message: `Grupo ${group} excluído com sucesso` });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
