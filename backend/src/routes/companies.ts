import { Router } from 'express';
import { getCompanyById, getDashboardStats, getTopCompanies, listCompanies } from '../db/database.js';

export const companiesRouter = Router();

companiesRouter.get('/stats', async (_request, response) => {
  response.json(await getDashboardStats());
});

companiesRouter.get('/top', async (request, response) => {
  const limit = Number(request.query.limit ?? 10);
  response.json(await getTopCompanies(Number.isFinite(limit) ? limit : 10));
});

companiesRouter.get('/:id', async (request, response) => {
  const company = await getCompanyById(request.params.id);

  if (!company) {
    response.status(404).json({ message: 'Empresa nao encontrada.' });
    return;
  }

  response.json(company);
});

companiesRouter.get('/', async (request, response) => {
  const minScore = request.query.minScore ? Number(request.query.minScore) : undefined;
  response.json(
    await listCompanies({
      noSite: request.query.noSite === 'true',
      hasSite: request.query.hasSite === 'true',
      minScore: Number.isFinite(minScore) ? minScore : undefined
    })
  );
});
