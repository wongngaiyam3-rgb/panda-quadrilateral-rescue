const TEACHER_SESSION_KEY="panda-rescue-teacher-session";
let teacherSession="";
export function getTeacherSession():string{
 if(teacherSession)return teacherSession;
 try{return typeof window!=="undefined"?window.sessionStorage.getItem(TEACHER_SESSION_KEY)||"":"";}catch{return "";}
}
export function setTeacherSession(token:string){
 teacherSession=token;
 if(typeof window!=="undefined")try{if(token)window.sessionStorage.setItem(TEACHER_SESSION_KEY,token);else window.sessionStorage.removeItem(TEACHER_SESSION_KEY);}catch{/* Memory fallback keeps the current tab usable if storage is blocked. */}
}
/** Platform authentication may return an HTML page before reaching our API. */
export async function readApiResponse(response:Response):Promise<any>{
 const text=await response.text();
 const type=response.headers.get("content-type")||"";
 if(type.includes("text/html")||/^\s*</.test(text)){
  if(response.status===401||response.status===403||response.redirected||/signin-with-chatgpt|sign in|登入/i.test(text)){
   throw new Error("網站登入狀態已失效，請按「重新登入網站」後繼續。你的學習紀錄會保留。");
  }
  throw new Error("課堂服務暫時未能回傳資料，請稍後重試；如果持續出現，請重新登入網站。");
 }
 let result:any;
 try{result=JSON.parse(text);}catch{throw new Error("課堂資料讀取失敗，請稍後重試。");}
 if(!response.ok)throw new Error(typeof result?.error==="string"?result.error:"連線失敗，請重試。");
 if(!result||typeof result!=="object"||Array.isArray(result))throw new Error("課堂資料格式不正確，請重新整理網站。");
 return result;
}
