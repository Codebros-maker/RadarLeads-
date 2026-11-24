import express from 'express';
import { app } from '../backend/src/app.js';

// O Express remove o prefixo antes de encaminhar para as rotas existentes.
const handler = express();
handler.use('/_/backend', app);
handler.use('/api', app);

export default handler;
