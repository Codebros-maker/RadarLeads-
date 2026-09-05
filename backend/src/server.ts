import 'dotenv/config';
import './db/database.js';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 3333);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`RadarLeads API running on http://localhost:${port}`);
  });
}

export default app;
