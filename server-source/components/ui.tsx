"use client";
import {ArrowRight,BookOpen,Map,ShieldCheck,Sprout,Check,Lock,Flag,Search,Box,Diamond,Route,Construction} from "lucide-react";
import {Panda} from "./art";
import {stages} from "@/lib/curriculum";
import {API_ORIGIN} from "@/config";
import {readApiResponse,getTeacherSession} from "@/lib/api-client";
export type Answer=Record<string,any>;
export type Room={id:string;code:string;name:string;class_name:string;mode:string;opened:number;paused:number;created:number};
export type RecordRow={stage:number;draft:Answer;attempts:number;passed:number;feedback:string;updated:number;label?:string;learner_id?:string};
export type StudentState={room:Room;learner:{id:string;label:string;completed:number};records:RecordRow[]};
export async function request(data?:unknown,token?:string,query=""):Promise<any>{
 const action=(data as {action?:string}|undefined)?.action;
 const isTeacher=new URLSearchParams(query).get("teacher")==="1"||["create","control","mark","recover","logout"].includes(action||"");
 const teacherSession=isTeacher?getTeacherSession():"";
 const r=await fetch(`${API_ORIGIN}/api/classroom${query}`,{method:data?"POST":"GET",headers:{Accept:"application/json",...(data?{"Content-Type":"application/json"}:{}),...(token?{"x-learner-token":token}:{}),...(teacherSession?{"x-teacher-session":teacherSession}:{})},...(data?{body:JSON.stringify(data)}:{}),credentials:"omit",cache:"no-store",signal:AbortSignal.timeout(15000)}).catch(()=>{throw new Error("連線暫時未完成，請重試。尚未同步的答案會保留在本機。");});return readApiResponse(r);
}
export function Header({active="map",label,save,onNavigate}:{active?:string;label?:string;save?:string;onNavigate?:(e:React.MouseEvent)=>void}){return <header className="topbar" onClickCapture={onNavigate}><a className="brand" href="/"><span className="brand-mark"><Sprout size={23}/></span><span>熊貓救援隊<small>四邊形秘境 · GEOMETRY QUEST</small></span></a><nav><a className={active==="map"?"nav-active":""} href="/map/"><Map size={17}/><span>任務地圖</span></a><a className={active==="journal"?"nav-active":""} href="/journal/"><BookOpen size={17}/><span>發現手冊</span></a><a className={active==="teacher"?"nav-active":""} href="/teacher/"><ShieldCheck size={17}/><span>老師基地</span></a></nav>{label&&<span className="identity"><i/>{label}<small>{save||"進度自動保存"}</small></span>}</header>}
export function Footer(){return <footer><Sprout size={16}/><span>每個發現，都是救援的一小步。</span><span>小四數學 · 四邊形的關係</span></footer>}
export function StageIcon({index,size=24}:{index:number;size?:number}){const Icon=[Construction,Search,Box,Diamond,Route,Map,Flag][index-1]||Flag;return <Icon size={size}/>}
export function Choices({title,value,options,onChange}:{title:string;value?:string;options:[string,string][];onChange:(s:string)=>void}){return <fieldset className="question"><legend>{title}</legend><div className="choice-list">{options.map(([id,text])=><button type="button" key={id} className={`choice ${value===id?"selected":""}`} onClick={()=>onChange(id)} aria-pressed={value===id}><span className="radio">{value===id&&<Check size={12}/>}</span>{text}</button>)}</div></fieldset>}
export function Toggle({value,label,onClick}:{value:boolean;label:string;onClick:()=>void}){return <button type="button" className={`choice ${value?"selected":""}`} aria-pressed={value} onClick={onClick}><span className="check-box">{value&&<Check size={14}/>}</span>{label}</button>}
export function ErrorBox({error}:{error:string}){return error?<div role="alert" className="error-box"><span>{error}</span>{error.includes("重新登入網站")&&<a href={`${API_ORIGIN}/signin-with-chatgpt?return_to=%2F`} target="_top" className="secondary">重新登入網站<ArrowRight size={15}/></a>}</div>:null;}
export function Loading(){return <div className="loading"><Sprout className="spin" size={30}/><p>正在連接救援基地…</p></div>}
export function StageCard({n,completed,opened,paused}:{n:number;completed:number;opened:number;paused:boolean}){const done=n<=completed,ready=n<=opened&&n<=completed+1&&!paused;return <a href={ready?`/quest/${n}/`:"#"} onClick={e=>!ready&&e.preventDefault()} className={`stage-card ${done?"done":ready?"ready":"locked"}`} aria-disabled={!ready}><div className="stage-top"><span>MISSION {String(n).padStart(2,"0")}</span>{done?<Check size={18}/>:ready?<ArrowRight size={18}/>:<Lock size={16}/>}</div><div className="stage-icon"><StageIcon index={n} size={28}/></div><h3>{stages[n-1].title}</h3><p>{stages[n-1].short}</p><span className="stage-status">{done?"已完成 · 可以回顧":paused?"老師已暫停":ready?"開始探索":n>opened?"等待老師開啟":"先完成上一關"}</span></a>}
export function Buddy({children,happy=false}:{children:React.ReactNode;happy?:boolean}){return <div className="buddy"><Panda happy={happy}/><div><strong>小竹隊長的提醒</strong>{children}</div></div>}
