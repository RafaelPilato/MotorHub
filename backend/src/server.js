// Ponto de entrada: sobe o servidor HTTP.
const app = require('./app');

const PORTA = process.env.PORT || 3001;

app.listen(PORTA, () => {
  console.log(`MotorHub API rodando em http://localhost:${PORTA}`);
});
