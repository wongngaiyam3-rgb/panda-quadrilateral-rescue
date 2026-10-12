import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
const sql=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())sql.exec(readFileSync('drizzle/'+file,'utf8'));
function prepare(query){let values=[];return {bind(...args){values=args;return this},async first(){return sql.prepare(query).get(...values)||null},async all(){return {results:sql.prepare(query).all(...values)}},async run(){return sql.prepare(query).run(...values)}}}
export const env={TEACHER_PASSWORD:'test-password',DB:{prepare,async batch(statements){sql.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}}}};
