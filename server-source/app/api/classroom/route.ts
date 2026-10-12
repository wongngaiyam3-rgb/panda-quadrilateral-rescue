import {env} from "cloudflare:workers";
import {assess,canEnter} from "@/lib/assessment";
export const dynamic="force-dynamic";
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const db=()=>{if(!env.DB)throw new Error("課堂資料庫尚未連接。");return env.DB;};
const now=()=>Date.now();
async function hash(s:string){const data=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,"0")).join("");}
function cookie(req:Request){return req.headers.get("cookie")?.match(/(?:^|;\s*)panda_teacher=([^;]+)/)?.[1]||"";}
function teacherToken(req:Request){return req.headers.get("x-teacher-session")||cookie(req);}
async function teacher(req:Request){const t=teacherToken(req);if(!t)return false;const session=await db().prepare("SELECT expires FROM sessions WHERE token_hash=?").bind(await hash(t)).first<{expires:number}>();return !!session&&session.expires>now();}
async function learner(req:Request){const token=req.headers.get("x-learner-token");if(!token)return null;return db().prepare("SELECT * FROM learners WHERE token_hash=?").bind(await hash(token)).first<any>();}
async function roomById(id:string){return db().prepare("SELECT * FROM classrooms WHERE id=?").bind(id).first<any>();}
async function state(l:any){const room=await roomById(l.room_id);const rs=await db().prepare("SELECT stage,draft,attempts,passed,feedback,updated FROM records WHERE learner_id=? ORDER BY stage").bind(l.id).all<any>();return {learner:{id:l.id,label:l.label,completed:l.completed},room,records:rs.results.map(r=>({...r,draft:JSON.parse(r.draft)}))};}
const FRONTEND_ORIGIN="https://wongngaiyam3-rgb.github.io";
function validOrigin(req:Request){const origin=req.headers.get("origin");return !origin||origin===new URL(req.url).origin||origin===FRONTEND_ORIGIN;}
function cors(req:Request,response:Response){const headers=new Headers(response.headers);if(req.headers.get("origin")===FRONTEND_ORIGIN){headers.set("Access-Control-Allow-Origin",FRONTEND_ORIGIN);headers.set("Vary","Origin");}return new Response(response.body,{status:response.status,headers});}
export async function OPTIONS(req:Request){if(!validOrigin(req))return json({error:"來源不被允許。"},403);return cors(req,new Response(null,{status:204,headers:{"Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-Learner-Token, X-Teacher-Session","Access-Control-Max-Age":"600"}}));}
export async function GET(req:Request){return cors(req,await handleGET(req));}
export async function POST(req:Request){return cors(req,await handlePOST(req));}
async function handleGET(req:Request){try{
 const url=new URL(req.url);
 if(url.searchParams.get("rooms")==="1"){
  const rows=await db().prepare("SELECT id,class_name,mode,name,opened,paused FROM classrooms ORDER BY created DESC,id DESC").all<any>();
  const seen=new Set<string>();const rooms=rows.results.filter(r=>{if(seen.has(r.class_name))return false;seen.add(r.class_name);return true;});
  return json({rooms});
 }
 if(url.searchParams.get("teacher")==="1"){
  if(!await teacher(req))return json({error:"請先輸入老師密碼。"},401);
  const id=url.searchParams.get("room");
  if(!id){const rooms=await db().prepare("SELECT * FROM classrooms ORDER BY created DESC LIMIT 100").all();return json({rooms:rooms.results});}
  const room=await roomById(id);if(!room)return json({error:"找不到課堂。"},404);
  const ls=await db().prepare("SELECT id,label,completed,last_seen FROM learners WHERE room_id=? ORDER BY label").bind(id).all();
  const rs=await db().prepare("SELECT r.stage,r.draft,r.attempts,r.passed,r.feedback,r.updated,l.label,l.id AS learner_id FROM records r JOIN learners l ON r.learner_id=l.id WHERE l.room_id=? ORDER BY r.updated DESC").bind(id).all<any>();
  return json({room,learners:ls.results,records:rs.results.map(r=>({...r,draft:JSON.parse(r.draft)}))});
 }
 const l=await learner(req);if(!l)return json({error:"請先加入課堂。"},401);
 await db().prepare("UPDATE learners SET last_seen=? WHERE id=?").bind(now(),l.id).run();
 return json(await state(l));
 }catch(e){return json({error:e instanceof Error?e.message:"讀取失敗，請重試。"},500);}}
async function handlePOST(req:Request){try{
 if(!validOrigin(req))return json({error:"請從網站內提交。"},403);
 const text=await req.text();if(text.length>40000)return json({error:"提交內容過長。"},413);
 const a=JSON.parse(text),action=a.action;
 if(action==="login"){
  const password=(env as unknown as Record<string,string>).TEACHER_PASSWORD;if(!password)return json({error:"老師密碼尚未設定。"},503);
  if(await hash(String(a.password||""))!==await hash(password))return json({error:"密碼不正確，請再試一次。"},401);
  const token=crypto.randomUUID()+crypto.randomUUID();await db().prepare("INSERT INTO sessions(token_hash,expires) VALUES(?,?)").bind(await hash(token),now()+12*60*60*1000).run();
  const response=json({ok:true,sessionToken:token});response.headers.set("Set-Cookie",`panda_teacher=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);return response;
 }
 if(action==="logout"){const t=teacherToken(req);if(t)await db().prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(t)).run();const r=json({ok:true});r.headers.set("Set-Cookie","panda_teacher=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");return r;}
 if(["create","control","mark"].includes(action)){
  if(!await teacher(req))return json({error:"老師登入已過期，請重新登入。"},401);
  if(action==="create"){
   if(!["4A","4B","4C"].includes(a.className)||!["individual","group"].includes(a.mode))return json({error:"請選擇班別和活動模式。"},400);
   const id=crypto.randomUUID(),code=crypto.randomUUID().replace(/-/g,"").slice(0,6).toUpperCase();
   const name=String(a.name||`${a.className}四邊形救援`).trim().slice(0,80);
   await db().prepare("INSERT INTO classrooms(id,code,name,class_name,mode,opened,paused,created) VALUES(?,?,?,?,?,1,0,?)").bind(id,code,name,a.className,a.mode,now()).run();return json({room:await roomById(id)});
  }
  const room=await roomById(String(a.roomId));if(!room)return json({error:"找不到課堂。"},404);
  if(action==="control"){
   if(a.opened!==undefined&&(!Number.isInteger(a.opened)||a.opened<1||a.opened>7))return json({error:"關卡必須為1至7。"},400);
   await db().prepare("UPDATE classrooms SET opened=?,paused=? WHERE id=?").bind(a.opened??room.opened,a.paused===undefined?room.paused:a.paused?1:0,room.id).run();return json({room:await roomById(room.id)});
  }
  const l=await db().prepare("SELECT * FROM learners WHERE id=? AND room_id=?").bind(String(a.learnerId),room.id).first<any>();
  if(!l||!Number.isInteger(a.stage)||a.stage<1||a.stage>7)return json({error:"學生或關卡不正確。"},400);
  if(a.stage>l.completed+1)return json({error:"請依序標記完成。"},409);
  await db().batch([
   db().prepare("UPDATE learners SET completed=MAX(completed,?) WHERE id=?").bind(a.stage,l.id),
   db().prepare("INSERT INTO records(id,learner_id,stage,draft,attempts,passed,feedback,updated) VALUES(?,?,?,'{}',0,1,?,?) ON CONFLICT(learner_id,stage) DO UPDATE SET passed=1,feedback=excluded.feedback,updated=excluded.updated").bind(crypto.randomUUID(),l.id,a.stage,"老師已檢視並標記完成。",now()),
  ]);return json({ok:true});
 }
 if(action==="join"){
  if(!["4A","4B","4C"].includes(a.className))return json({error:"請選擇班別。"},400);
  const room=await db().prepare("SELECT * FROM classrooms WHERE class_name=? ORDER BY created DESC,id DESC LIMIT 1").bind(a.className).first<any>();
  if(!room)return json({error:`老師尚未建立${a.className}的課堂，請稍候。`},404);
  if(a.className!==room.class_name)return json({error:`這個課堂屬於${room.class_name}，請選擇相同班別。`},400);
  const num=Number(a.number),limit=room.mode==="group"?6:25;if(!Number.isInteger(num)||num<1||num>limit)return json({error:`請選擇1至${limit}${room.mode==="group"?"組":"號"}。`},400);
  const label=`${room.class_name} ${String(num).padStart(2,"0")}${room.mode==="group"?"組":"號"}`;
  const existing=await db().prepare("SELECT id FROM learners WHERE room_id=? AND label=?").bind(room.id,label).first();
  if(existing)return json({error:"這個學號／小組已加入。請用原裝置的「繼續任務」；換裝置時請貼上救援通行碼。"},409);
  const token=crypto.randomUUID()+crypto.randomUUID(),id=crypto.randomUUID();
  await db().prepare("INSERT INTO learners(id,room_id,label,token_hash,completed,last_seen) VALUES(?,?,?,?,0,?)").bind(id,room.id,label,await hash(token),now()).run();
  const l=await learner(new Request(req.url,{headers:{"x-learner-token":token}}));return json({token,...await state(l)});
 }
 const l=await learner(req);if(!l)return json({error:"通行碼失效，請重新加入課堂。"},401);
 const room=await roomById(l.room_id);const stage=Number(a.stage);
 if(!["draft","submit"].includes(action))return json({error:"未知操作。"},400);
 if(!canEnter(stage,l.completed,room.opened,room.paused))return json({error:room.paused?"老師已暫停活動，請先看老師示範。":"這一關尚未開啟，或你還未完成上一關。"},403);
 if(!a.answer||typeof a.answer!=="object"||Array.isArray(a.answer))return json({error:"答案格式不正確。"},400);
 const result=action==="submit"?assess(stage,a.answer):{passed:false,feedback:""};
 const existing=await db().prepare("SELECT passed FROM records WHERE learner_id=? AND stage=?").bind(l.id,stage).first<any>();
 if(action==="draft"&&existing?.passed)return json({ok:true});
 const draft=JSON.stringify(a.answer);
 await db().batch([
  db().prepare("INSERT INTO records(id,learner_id,stage,draft,attempts,passed,feedback,updated) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(learner_id,stage) DO UPDATE SET draft=excluded.draft,attempts=records.attempts+excluded.attempts,passed=MAX(records.passed,excluded.passed),feedback=CASE WHEN excluded.attempts=1 THEN excluded.feedback ELSE records.feedback END,updated=excluded.updated").bind(crypto.randomUUID(),l.id,stage,draft,action==="submit"?1:0,result.passed?1:0,result.feedback,now()),
  db().prepare("UPDATE learners SET completed=MAX(completed,?),last_seen=? WHERE id=?").bind(result.passed?stage:l.completed,now(),l.id),
 ]);
 return json({...result,...await state({...l,completed:result.passed?Math.max(stage,l.completed):l.completed})});
 }catch(e){return json({error:e instanceof Error?e.message:"操作失敗，請重試。"},500);}}
