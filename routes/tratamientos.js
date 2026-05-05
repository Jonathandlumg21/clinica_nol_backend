const express = require('express');
const prisma  = require('../lib/prisma');

const router = express.Router();

// GET /api/tratamientos?paciente=1
router.get('/', async (req, res) => {
  try {
    const where = req.query.paciente ? { id_paciente: Number(req.query.paciente) } : {};
    const tratamientos = await prisma.tratamiento.findMany({
      where,
      orderBy: { creado_en: 'desc' },
      include: { medico: { select: { id: true, nombre: true } } }
    });
    res.json(tratamientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tratamientos/:id
router.get('/:id', async (req, res) => {
  try {
    const tratamiento = await prisma.tratamiento.findUnique({
      where: { id: Number(req.params.id) },
      include: { medico: { select: { id: true, nombre: true } } }
    });
    if (!tratamiento) return res.status(404).json({ error: 'Tratamiento no encontrado' });
    res.json(tratamiento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tratamientos
router.post('/', async (req, res) => {
  const { id_paciente, descripcion, medicamento, dosis, fecha_inicio, fecha_fin, id_medico } = req.body;
  if (!id_paciente || !descripcion)
    return res.status(400).json({ error: 'id_paciente y descripcion requeridos' });

  try {
    const tratamiento = await prisma.tratamiento.create({
      data: {
        id_paciente:  Number(id_paciente),
        descripcion,
        medicamento,
        dosis,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
        fecha_fin:    fecha_fin    ? new Date(fecha_fin)    : null,
        id_medico:    id_medico    ? Number(id_medico)      : null
      }
    });
    res.status(201).json(tratamiento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tratamientos/:id
router.put('/:id', async (req, res) => {
  const { descripcion, medicamento, dosis, fecha_inicio, fecha_fin, activo, id_medico } = req.body;
  try {
    const tratamiento = await prisma.tratamiento.update({
      where: { id: Number(req.params.id) },
      data: {
        descripcion,
        medicamento,
        dosis,
        activo,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
        fecha_fin:    fecha_fin    ? new Date(fecha_fin)    : null,
        id_medico:    id_medico    ? Number(id_medico)      : null
      }
    });
    res.json(tratamiento);
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tratamientos/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.tratamiento.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Tratamiento eliminado' });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
