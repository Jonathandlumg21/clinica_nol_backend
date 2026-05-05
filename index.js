const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/pacientes',   require('./routes/pacientes'));
app.use('/api/usuarios',    require('./routes/usuarios'));
app.use('/api/diagnosticos',require('./routes/diagnosticos'));
app.use('/api/tratamientos',require('./routes/tratamientos'));
app.use('/api/consultas',   require('./routes/consultas'));

app.get('/', (req, res) => res.json({ sistema: 'Clínica Nol', status: 'activo' }));

app.listen(process.env.PORT || 3001, () => {
  console.log('🏥 Clínica Nol backend corriendo en puerto 3001');
});