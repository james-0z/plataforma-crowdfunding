import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PUERTO = process.env.PUERTO || 3000;

app.listen(PUERTO, () => {
  console.log(` Servidor corriendo en http://localhost:${PUERTO}`);
});