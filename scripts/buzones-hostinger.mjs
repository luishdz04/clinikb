/**
 * Lista los buzones que puede administrar el token de Hostinger.
 *
 * El `resourceId` de cada buzón no aparece en el panel: hay que preguntárselo
 * a la API. Ese id es el que va en HOSTINGER_MAILBOX_ID.
 *
 *   node scripts/buzones-hostinger.mjs
 */
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

const token = env.HOSTINGER_MAIL_TOKEN;
if (!token) {
  console.error('Falta HOSTINGER_MAIL_TOKEN en .env.local');
  process.exit(1);
}

const res = await fetch('https://api.mail.hostinger.com/api/v1/me', {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
});

if (!res.ok) {
  console.error(`La API respondió ${res.status}:`, await res.text());
  process.exit(1);
}

const { data } = await res.json();
const buzones = data?.mailboxes ?? [];

if (buzones.length === 0) {
  console.log('El token no tiene ningún buzón autorizado.');
} else {
  console.log(`${buzones.length} buzón(es) autorizado(s):\n`);
  for (const b of buzones) {
    console.log(`  ${b.address}`);
    console.log(`    HOSTINGER_MAILBOX_ID=${b.resourceId}\n`);
  }
}
