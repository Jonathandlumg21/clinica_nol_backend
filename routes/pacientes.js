const express = require('express');
const prisma  = require('../lib/prisma');

const router = express.Router();

// GET /api/pacientes
router.get('/', async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      orderBy: { id: 'desc' },
      include: {
        medico:  { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true } }
      }
    });
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pacientes/:id
router.get('/:id', async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        medico:       { select: { id: true, nombre: true } },
        creador:      { select: { id: true, nombre: true } },
        diagnosticos: { orderBy: { creado_en: 'desc' } },
        tratamientos: { orderBy: { creado_en: 'desc' } },
        consultas:    { orderBy: { fecha: 'desc' } }
      }
    });
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pacientes
router.post('/', async (req, res) => {
  const { nombre, apellido, fecha_nacimiento, sexo, telefono, direccion, id_medico, id_creador } = req.body;
  if (!nombre || !apellido)
    return res.status(400).json({ error: 'Nombre y apellido requeridos' });

  try {
    const paciente = await prisma.paciente.create({
      data: {
        nombre, apellido, sexo, telefono, direccion,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        id_medico:  id_medico  ? Number(id_medico)  : null,
        id_creador: id_creador ? Number(id_creador) : null
      }
    });
    res.status(201).json(paciente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pacientes/:id
router.put('/:id', async (req, res) => {
  const { nombre, apellido, fecha_nacimiento, sexo, telefono, direccion, id_medico } = req.body;
  try {
    const paciente = await prisma.paciente.update({
      where: { id: Number(req.params.id) },
      data: {
        nombre, apellido, sexo, telefono, direccion,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        id_medico: id_medico ? Number(id_medico) : null,
        actualizado_en: new Date()
      }
    });
    res.json(paciente);
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Paciente no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pacientes/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.paciente.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Paciente eliminado' });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Paciente no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
