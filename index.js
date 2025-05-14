import express from 'express'
import cors from 'cors'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const adapter = new JSONFile('db.json')
const db = new Low(adapter)
await db.read()

db.data ||= { trafficLights: [], groups: {} }

function getGroupLights(group) {
  return db.data.trafficLights.filter(l => l.group === group)
}

function resetGroup(group) {
  const lights = getGroupLights(group)
  lights.forEach(l => l.status = 'red')
  const first = lights.find(l => l.order === 1)
  if (first) first.status = 'green'
}

// Listar todos
app.get('/api/traffic-lights', async (req, res) => {
  await db.read()
  res.json(db.data.trafficLights)
})

// Adicionar grupo
app.post('/api/traffic-lights/group', async (req, res) => {
  const { group, lights, greenTime } = req.body

  db.data.trafficLights = db.data.trafficLights.filter(l => l.group !== group)
  db.data.trafficLights.push(...lights)
  db.data.groups[group] = { greenTime }

  await db.write()
  res.json({ ok: true })
})

// Resetar grupo
app.post('/api/reset-group/:group', async (req, res) => {
  const group = parseInt(req.params.group)
  resetGroup(group)
  await db.write()
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
})
