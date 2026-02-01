import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const sql = `
  SELECT e.*, 
         (SELECT COUNT(*) FROM entity_timeline WHERE entityId = e.id) as timelineCount,
         (SELECT COUNT(*) FROM entity_links WHERE sourceEntityId = e.id OR targetEntityId = e.id) as relationshipCount,
         (SELECT COUNT(*) FROM entity_claims WHERE entity_id = e.id AND status = 'verified') as verifiedClaimsCount
  FROM entities e
  WHERE 1=1
  ORDER BY e.name LIMIT 3 OFFSET 0
`;

const result = await conn.execute(sql);
console.log('Result type:', typeof result);
console.log('Is array:', Array.isArray(result));
console.log('Result length:', result.length);
console.log('Result[0] length:', result[0]?.length);
console.log('First entity name:', result[0]?.[0]?.name);

await conn.end();
