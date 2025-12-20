// Script para verificar/generar hash de contraseña de empleado
const bcrypt = require('bcryptjs');

const hash = '$2b$10$dsXxx17KLBV6GtKoNR/jHeRTmxyx6WL6qD5J98pTp8XDjYHCnAPkW';

// Contraseñas comunes a probar
const passwordsToTest = [
  'MUP2025',
  'admin',
  'Admin123',
  'admin123',
  'muscleup',
  'MuscleUp2025',
  'muscleup2025',
  '123456',
  'password',
];

console.log('🔍 Probando contraseñas comunes contra el hash...\n');

passwordsToTest.forEach(async (password) => {
  const match = await bcrypt.compare(password, hash);
  if (match) {
    console.log(`✅ ¡ENCONTRADA! La contraseña es: "${password}"`);
  }
});

// Generar nuevo hash si quieres cambiar la contraseña
const newPassword = 'admin123'; // Cambia esto por la contraseña que quieras
bcrypt.hash(newPassword, 10).then(newHash => {
  console.log(`\n📝 Nuevo hash para la contraseña "${newPassword}":`);
  console.log(newHash);
  console.log('\nPuedes actualizar la BD con:');
  console.log(`UPDATE employees SET password_hash = '${newHash}' WHERE email = 'administracion@muscleupgym.fitness';`);
});
