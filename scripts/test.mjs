import {build} from 'esbuild';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
await build({entryPoints:['server-source/app/api/classroom/route.ts'],outfile:'server-source/.sites-runtime/route-test.mjs',bundle:true,platform:'node',format:'esm',alias:{'@':resolve('server-source'),'cloudflare:workers':resolve('server-source/tests/env.mjs')}});
const result=spawnSync(process.execPath,['tests/classroom.mjs'],{cwd:resolve('server-source'),stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);
await build({entryPoints:['tests/regression.tsx'],outfile:'.tmp/regression.mjs',bundle:true,platform:'node',format:'esm',jsx:'automatic',alias:{'@':resolve('src'),'cloudflare:workers':resolve('server-source/tests/env.mjs')},external:['react','react/*','react-test-renderer'],banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"}});
process.chdir(resolve('server-source'));
await import('file://'+resolve(root,'.tmp/regression.mjs'));
