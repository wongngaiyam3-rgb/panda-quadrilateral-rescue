import React from 'react';
import {act,create} from 'react-test-renderer';
import assert from 'node:assert/strict';
import {setTimeout as wait} from 'node:timers/promises';
import {Geometry,svgCoordinates} from '../src/components/geometry';
import {Student} from '../src/components/student';
import {Teacher} from '../src/components/teacher';
import {GET,POST} from '../server-source/app/api/classroom/route';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
const intervals=new Map();const timeouts=new Map();let id=0;
globalThis.setInterval=((fn:any)=>{intervals.set(++id,fn);return id}) as any;globalThis.clearInterval=((n:any)=>intervals.delete(n)) as any;
globalThis.setTimeout=((fn:any,ms:any)=>{if(ms===0)Promise.resolve().then(fn);else timeouts.set(++id,fn);return id}) as any;globalThis.clearTimeout=((n:any)=>timeouts.delete(n)) as any;
const memory=new Map(),session=new Map();const storage=(m:Map<any,any>)=>({getItem:(k:string)=>m.get(k)||null,setItem:(k:string,v:string)=>m.set(k,v),removeItem:(k:string)=>m.delete(k)});
(globalThis as any).localStorage=storage(memory);(globalThis as any).window={sessionStorage:storage(session),location:{href:'',hash:'',origin:'https://test.local',pathname:'/panda-quadrilateral-rescue/'},history:{replaceState(){}},addEventListener(){},removeEventListener(){}};
const requests:any[]=[];globalThis.fetch=async(input:any,init:any)=>{const req=new Request(String(input),init);requests.push({method:req.method,body:init?.body});return req.method==='POST'?POST(req):GET(req)};
const settle=()=>new Promise(r=>setImmediate(r));const text=(n:any):string=>typeof n==='string'?n:n?.children?.map(text).join('')||'';
const button=(r:any,label:string)=>r.root.findAllByType('button').find((b:any)=>text(b).includes(label));
async function expectText(r:any,value:string){for(let n=0;n<200&&!text(r.root).includes(value);n++)await act(async()=>{await wait(5)});assert(text(r.root).includes(value),value);}
async function mount(Component:any,props:any={}){let r:any;await act(async()=>{r=create(<Component {...props}/>);await settle();await settle()});await act(async()=>{await settle();await settle()});return r;}
async function click(b:any){assert(b,'button exists');await act(async()=>{await b.props.onClick?.({preventDefault(){}});await settle();await settle()});}
async function form(r:any){await act(async()=>{await r.root.findAllByType('form')[0].props.onSubmit({preventDefault(){}});await settle();await settle()});await act(async()=>{await settle();await settle()});}
let teacher=await mount(Teacher);await act(async()=>teacher.root.findByType('input').props.onChange({target:{value:'test-password'}}));await form(teacher);await form(teacher);
await expectText(teacher,"目前開放至第1關");
let student=await mount(Student);const classSelect=student.root.findAllByType("select")[0];assert.deepEqual(classSelect.findAllByType("option").map(o=>o.props.value),["4A","4B","4C"],"班別狀態標籤不能改變提交值");await form(student);const oldToken=memory.get('panda-rescue-pass');await act(async()=>student.unmount());student=await mount(Student,{view:'quest',stage:1});await expectText(student,'保持不變');
await click(button(student,'保持不變'));assert(text(student.root).includes('尚未保存'));
const parent=student.root.findByType('main');await act(async()=>{await parent.props.onClickCapture({target:{closest:()=>({target:'',getAttribute:()=>'/panda-quadrilateral-rescue/map/'})},preventDefault(){}});await settle()});
const saved=await (await GET(new Request('https://test.local/api/classroom',{headers:{'x-learner-token':oldToken}}))).json();assert.equal(saved.records[0].draft.rotation,'same');assert.equal(window.location.href,'/panda-quadrilateral-rescue/map/');
console.log('PASS navigation saves immediately; local answer preserved and saved status accurate.');
await act(async()=>student.unmount());
let g:any,moved=3,move:any;await act(async()=>{g=create(<Geometry width={3} angle={90} onWidth={v=>moved=v}/>,{createNodeMock:e=>e.type==='svg'?{getBoundingClientRect:()=>({left:0,top:0,width:700,height:360})}:null})});
const circle=g.root.findByType('circle');circle.props.onPointerDown({clientX:417.5,clientY:112.5,pointerId:1,currentTarget:{setPointerCapture(){},addEventListener(n:string,f:any){if(n==='pointermove')move=f},removeEventListener(){}}});move({clientX:417.5,clientY:112.5});assert.equal(moved,3);move({clientX:440,clientY:112.5});assert.equal(moved,4);
assert(Math.abs(svgCoordinates({left:0,top:0,width:700,height:360},417.5,112.5).x-310)<.001);await act(async()=>g.unmount());
console.log('PASS scaled drag: stationary handle remains 3; moving one unit reaches 4.');
const before=requests.length;let preview=await mount(Student,{view:'quest',stage:2,preview:true});
assert(!preview.root.findAllByType('button').some((b:any)=>text(b).includes('量四條邊')&&b.props.className==='active'));
await click(button(preview,'量四條邊'));
for(const pair of [[0,1],[1,2],[2,3],[3,0]])for(const i of pair)await click(preview.root.findAllByType('circle').find((c:any)=>c.props['aria-label']===`量度端點${'ABCD'[i]}`));
assert(text(button(preview,'量四條邊')).includes('量四條邊'));assert.equal(preview.root.findByType(Geometry).props.interactiveTool,'length');
await click(button(preview,'檢查四個角'));for(let i=0;i<4;i++)await click(preview.root.findAllByType('circle').find((c:any)=>c.props['aria-label']===`量度端點${'ABCD'[i]}`));
await click(button(preview,'比較對邊平行'));for(const i of [0,2,1,3])await click(preview.root.findAllByType('line').find((l:any)=>l.props['aria-label']===`選擇邊${['AB','BC','CD','DA'][i]}`));
assert(text(preview.root).includes('3/3工具'));assert.equal(requests.length,before);await act(async()=>preview.unmount());
console.log('PASS interactive tools: all 4 edges, 4 corners, 2 opposite pairs recorded; teacher preview makes no API requests.');
await click(button(teacher,'主動開啟第2關'));assert(text(teacher.root).includes('目前開放至第2關'));
await click(button(teacher,'建立新課堂'));await form(teacher);student=await mount(Student,{view:'map'});await expectText(student,'已建立新課堂');assert(text(student.root).includes('舊紀錄會保留'));
await click(button(student,'加入最新課堂'));assert(text(student.root).includes('加入救援隊'));assert.equal(memory.get('panda-rescue-pass'),undefined);assert(JSON.parse(memory.get('panda-rescue-pass:history')).length===1);
console.log('PASS new classroom notice and switching preserve old local pass.');
await act(async()=>{student.unmount();teacher.unmount()});
console.log('Frontend regression checks complete.');
