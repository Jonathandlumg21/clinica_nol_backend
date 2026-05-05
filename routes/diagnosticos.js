const express = require('express');
const prisma  = require('../lib/prisma');

const router = express.Router();

// GET /api/diagnosticos?paciente=1
router.get('/', async (req, res) => {
  try {
    const where = req.query.paciente ? { id_paciente: Number(req.query.paciente) } : {};
    const diagnosticos = await prisma.diagnostico.findMany({
      where,
      orderBy: { creado_en: 'desc' },
      include: { medico: { select: { id: true, nombre: true } } }
    });
    res.json(diagnosticos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/diagnosticos/:id
router.get('/:id', async (req, res) => {
  try {
    const diagnostico = await prisma.diagnostico.findUnique({
      where: { id: Number(req.params.id) },
      include: { medico: { select: { id: true, nombre: true } } }
    });
    if (!diagnostico) return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    res.json(diagnostico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/diagnosticos
router.post('/', async (req, res) => {
  const { id_paciente, enfermedad, descripcion, fecha, id_medico } = req.body;
  if (!id_paciente || !enfermedad)
    return res.status(400).json({ error: 'id_paciente y enfermedad requeridos' });

  try {
    const diagnostico = await prisma.diagnostico.create({
      data: {
        id_paciente: Number(id_paciente),
        enfermedad,
        descripcion,
        fecha: fecha ? new Date(fecha) : null,
        id_medico: id_medico ? Number(id_medico) : null
      }
    });
    res.status(201).json(diagnostico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/diagnosticos/:id
router.put('/:id', async (req, res) => {
  const { enfermedad, descripcion, fecha, id_medico } = req.body;
  try {
    const diagnostico = await prisma.diagnostico.update({
      where: { id: Number(req.params.id) },
      data: {
        enfermedad,
        descripcion,
        fecha: fecha ? new Date(fecha) : null,
        id_medico: id_medico ? Number(id_medico) : null
      }
    });
    res.json(diagnostico);
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/diagnosticos/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.diagnostico.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Diagnóstico eliminado' });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
