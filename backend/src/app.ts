import cors from 'cors';
import express from 'express';
import { companiesRouter } from './routes/companies.js';
import { searchRouter } from './routes/search.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'RadarLeads API' });
});

app.use('/companies', companiesRouter);
app.use('/search', searchRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Erro interno.';
  response.status(500).json({ message });
});
