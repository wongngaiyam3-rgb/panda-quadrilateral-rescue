import assert from 'node:assert/strict';
import {request} from '../components/ui';
import {setTeacherSession} from '../lib/api-client';
import {GET,POST} from '../app/api/classroom/route';
const originalFetch=globalThis.fetch;
// Browser simulation intentionally never persists or sends a Cookie.
(globalThis as any).window={get sessionStorage(){throw new Error('storage blocked')}};
globalThis.fetch=(async(input:any,init?:RequestInit)=>{
 const req=new Request(new URL(String(input),'https://test.local'),init);
 assert.equal(req.headers.get('cookie'),null);
 return req.method==='POST'?POST(req):GET(req);
}) as typeof fetch;
try{
 await assert.rejects(request({action:'login',password:'wrong'}),/密碼不正確/);
 const result=await request({action:'login',password:'test-password'});
 setTeacherSession(result.sessionToken);
 assert.ok(Array.isArray((await request(undefined,undefined,'?teacher=1')).rooms));
 const {room}=await request({action:'create',className:'4A',mode:'group',name:'前端流程測試'});
 await request({action:'control',roomId:room.id,opened:2});
 assert.equal((await request(undefined,undefined,'?teacher=1&room='+room.id)).room.opened,2);
 await request({action:'logout'});setTeacherSession('');
 await assert.rejects(request(undefined,undefined,'?teacher=1'),/老師密碼/);
 console.log('PASS: 實際前端登入→基地→建立課堂→開關→登出流程；Cookie及sessionStorage均被阻擋。');
}finally{globalThis.fetch=originalFetch;delete (globalThis as any).window;}
