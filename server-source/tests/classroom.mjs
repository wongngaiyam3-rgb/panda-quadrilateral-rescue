import assert from 'node:assert/strict';
import {GET,POST} from '../.sites-runtime/route-test.mjs';
let cookie='',token='',teacherSession='';
async function post(data,{auth=true,student=token}={}){const res=await POST(new Request('https://test.local/api/classroom',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://test.local',...(auth&&cookie?{cookie}:{}),...(auth&&teacherSession?{'x-teacher-session':teacherSession}:{}),...(student?{'x-learner-token':student}:{})},body:JSON.stringify(data)}));return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')}}
async function get(q='',student=token){const res=await GET(new Request('https://test.local/api/classroom'+q,{headers:{...(cookie?{cookie}:{}),...(teacherSession?{'x-teacher-session':teacherSession}:{}),...(student?{'x-learner-token':student}:{})}}));return {status:res.status,data:await res.json()}}
assert.equal((await post({action:'create',className:'4A',mode:'group'},{auth:false})).status,401);
assert.equal((await post({action:'login',password:'wrong'})).status,401);
const login=await post({action:'login',password:'test-password'});assert.equal(login.status,200);cookie=login.cookie.split(';')[0];
assert.equal((await get('?teacher=1')).status,200,'既有Cookie登入');
teacherSession=login.data.sessionToken;assert.equal(typeof teacherSession,'string');cookie='';
assert.equal((await get('?teacher=1')).status,200,'Cookie被阻擋時仍可進入基地');
const room=(await post({action:'create',name:'測試課堂',className:'4A',mode:'group'})).data.room;assert.equal(room.opened,1);
assert.equal((await get('?rooms=1')).data.rooms[0].mode,'group');
assert.equal((await get('?rooms=1')).data.rooms[0].code,undefined);
assert.equal((await post({action:'join',className:'4C',number:1})).status,404);
assert.equal((await post({action:'join',className:'bad',number:1})).status,400);
const join=await post({action:'join',className:'4A',number:1});assert.equal(join.status,200);token=join.data.token;
assert.equal((await post({action:'join',className:'4A',number:1})).status,409);
assert.equal((await post({action:'submit',stage:2,answer:{}})).status,403);
assert.equal((await post({action:'submit',stage:1,answer:{}})).data.passed,false);
assert.equal((await post({action:'draft',stage:1,answer:{rotation:'same'}})).status,200);
assert.equal((await get()).data.records[0].draft.rotation,'same');
const answers=[
 {edges:{0:['CD'],1:['AB','CD'],2:['BC']},rotation:'same'},
 {tools:{0:['length','angle','parallel'],1:['length','angle','parallel'],2:['length','angle','parallel'],3:['length','angle','parallel']},table:{0:{0:'true',1:'true',2:'true',3:'true'},1:{0:'true',1:'false',2:'true',3:'true'},2:{0:'false',1:'true',2:'true',3:'true'},3:{0:'false',1:'false',2:'true',3:'true'}}},
 {width:3,widths:[2,3,5],rectangle:'yes',reason:'angles'},
 {angle:90,angles:[60,90,120],rhombus:'yes',reason:'equal'},
 {builds:{rectangle:{width:4,side:3,angle:90},rhombus:{width:3,side:3,angle:60},square:{width:3,side:3,angle:90}},shared:['opposite','parallel']},
 {zones:{A:1,B:0,C:2,D:3,E:1,F:0,G:4},allSquares:'yes',allRectangles:'no'},
 {selected:{0:['A','B','E','F'],1:['A','C','E'],2:['A','B','C','D','E','F']},reverse:'no',explain:'both'}
];
for(let stage=1;stage<=7;stage++){
 if(stage>1){assert.equal((await post({action:'submit',stage,answer:answers[stage-1]})).status,403,'completion alone must not unlock');await post({action:'control',roomId:room.id,opened:stage});}
 const result=await post({action:'submit',stage,answer:answers[stage-1]});assert.equal(result.data.passed,true,JSON.stringify(result.data));assert.equal(result.data.learner.completed,stage);
}
assert.equal((await get()).data.learner.completed,7);
await post({action:'control',roomId:room.id,paused:true});assert.equal((await post({action:'draft',stage:7,answer:{}})).status,403);await post({action:'control',roomId:room.id,paused:false});
const second=await post({action:'join',className:'4A',number:2});assert.equal((await post({action:'submit',stage:7,answer:answers[6]},{student:second.data.token})).status,403,'teacher opening cannot bypass prerequisites');
assert.equal((await post({action:'mark',roomId:room.id,learnerId:second.data.learner.id,stage:3})).status,409);
assert.equal((await post({action:'mark',roomId:room.id,learnerId:second.data.learner.id,stage:1})).status,200);
const report=await get('?teacher=1&room='+room.id);assert.equal(report.data.learners.length,2);assert.equal(report.data.records.find(r=>r.stage===1&&r.learner_id===join.data.learner.id).attempts,2);
const room2=(await post({action:'create',className:'4B',mode:'individual'})).data.room;assert.equal(room2.opened,1);assert.equal(room2.paused,0);
assert.equal((await post({action:'control',roomId:room.id,opened:8})).status,400);
assert.equal((await post({action:'control',roomId:room.id,opened:1},{auth:false})).status,401);
console.log('PASS: 七關正確答案、錯誤重試、老師密碼、共用進度、逐關限制、暫停、跨課堂隔離、老師標記、報表。');

await new Promise(resolve=>setTimeout(resolve,2));
const newest=(await post({action:"create",className:"4A",mode:"individual",name:"新課堂"})).data.room;
const listing=(await get("?rooms=1")).data.rooms;
assert.equal(listing.filter(r=>r.class_name==="4A").length,1);
assert.equal(listing.find(r=>r.class_name==="4A").id,newest.id);
const direct=await post({action:"join",className:"4A",number:25});
assert.equal(direct.status,200);assert.equal(direct.data.room.id,newest.id);
assert.equal((await get()).data.learner.completed,7,"原有通行碼保留舊課堂進度");
console.log("PASS: 無代碼入班、每班最新課堂、小組與個人範圍、既有進度保留。");

await post({action:"logout"});assert.equal((await get("?teacher=1")).status,401,"登出必須撤銷憑證");teacherSession="invalid";assert.equal((await get("?teacher=1")).status,401,"無效憑證不能進入");console.log("PASS: 無Cookie老師登入、授權操作、登出撤銷與無效憑證拒絕。");
