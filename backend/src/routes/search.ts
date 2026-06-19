import { Router } from 'express';
import { upsertCompanies } from '../db/database.js';
import { scrapeGoogleMaps } from '../services/googleMapsScraper.js';

export const searchRouter = Router();

searchRouter.post('/', async (request, response, next) => {
  try {
    const query = String(request.body?.query ?? '').trim();
    const limit = request.body?.limit ? Number(request.body.limit) : undefined;

    if (!query) {
      response.status(400).json({ message: 'Informe uma busca, por exemplo: restaurantes em Manaus.' });
      return;
    }

    const scrapedCompanies = await scrapeGoogleMaps(query, Number.isFinite(limit) ? limit : undefined);
    const companies = await upsertCompanies(query, scrapedCompanies);

    response.status(201).json({
      query,
      found: companies.length,
      companies
    });
  } catch (error) {
    next(error);
  }
});
