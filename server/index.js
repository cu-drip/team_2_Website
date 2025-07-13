import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app        = express();
const BUILD_DIR  = path.join(__dirname, '../dist');

app.use(express.static(BUILD_DIR));

app.get('*userpath', (req, res) =>
  res.sendFile(path.join(BUILD_DIR, 'index.html'))
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});