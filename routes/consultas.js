const express = require('express');
const prisma  = require('../lib/prisma');

const router = express.Router();

// GET /api/consultas?paciente=1
router.get('/', async (req, res) => {
  try {
    const where = req.query.paciente ? { id_paciente: Number(req.query.paciente) } : {};
    const consultas = await prisma.consulta.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: { medico: { select: { id: true, nombre: true } } }
    });
    res.json(consultas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/consultas/:id
router.get('/:id', async (req, res) => {
  try {
    const consulta = await prisma.consulta.findUnique({
      where: { id: Number(req.params.id) },
      include: { medico: { select: { id: true, nombre: true } } }
    });
    if (!consulta) return res.status(404).json({ error: 'Consulta no encontrada' });
    res.json(consulta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/consultas
router.post('/', async (req, res) => {
  const { id_paciente, id_medico, fecha, motivo, notas, peso_kg, presion, temperatura } = req.body;
  if (!id_paciente)
    return res.status(400).json({ error: 'id_paciente requerido' });

  try {
    const consulta = await prisma.consulta.create({
      data: {
        id_paciente: Number(id_paciente),
        id_medico:   id_medico   ? Number(id_medico)   : null,
        fecha:       fecha       ? new Date(fecha)      : new Date(),
        motivo,
        notas,
        peso_kg:     peso_kg     ? Number(peso_kg)     : null,
        presion,
        temperatura: temperatura ? Number(temperatura) : null
      }
    });
    res.status(201).json(consulta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/consultas/:id
router.put('/:id', async (req, res) => {
  const { id_medico, fecha, motivo, notas, peso_kg, presion, temperatura } = req.body;
  try {
    const consulta = await prisma.consulta.update({
      where: { id: Number(req.params.id) },
      data: {
        id_medico:   id_medico   ? Number(id_medico)   : null,
        fecha:       fecha       ? new Date(fecha)      : undefined,
        motivo,
        notas,
        peso_kg:     peso_kg     ? Number(peso_kg)     : null,
        presion,
        temperatura: temperatura ? Number(temperatura) : null
      }
    });
    res.json(consulta);
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Consulta no encontrada' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/consultas/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.consulta.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Consulta eliminada' });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Consulta no encontrada' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
