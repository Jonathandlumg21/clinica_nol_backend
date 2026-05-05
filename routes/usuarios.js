const express = require('express');
const bcrypt  = require('bcryptjs');
const prisma  = require('../lib/prisma');

const router = express.Router();

const rolesValidos = ['admin', 'medico', 'secretaria'];

// GET /api/usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { id: 'desc' },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, creado_en: true }
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, creado_en: true }
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/usuarios
router.post('/', async (req, res) => {
  const { nombre, email, password, rol = 'secretaria' } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
  if (!rolesValidos.includes(rol))
    return res.status(400).json({ error: 'Rol inválido. Usa: admin, medico o secretaria' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: { nombre, email, password_hash: hash, rol },
      select: { id: true, nombre: true, email: true, rol: true }
    });
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
  const { nombre, email, password, rol, activo } = req.body;
  if (rol && !rolesValidos.includes(rol))
    return res.status(400).json({ error: 'Rol inválido. Usa: admin, medico o secretaria' });

  try {
    const data = { nombre, email, rol, activo };
    if (password) data.password_hash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, nombre: true, email: true, rol: true, activo: true }
    });
    res.json(usuario);
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.usuario.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
