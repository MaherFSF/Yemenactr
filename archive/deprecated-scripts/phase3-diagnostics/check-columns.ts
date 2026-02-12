import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const [rows] = await conn.execute('SHOW COLUMNS FROM coverage_cells');
  console.log(JSON.stringify(rows, null, 2));
  await conn.end();
}

main();
