import {cards} from "./curriculum";
type Answer=Record<string,any>;
const same=(a:unknown,b:string[])=>Array.isArray(a)&&a.length===b.length&&b.every(x=>a.includes(x));
export function assess(stage:number,a:Answer):{passed:boolean;feedback:string} {
 const fail=(feedback:string)=>({passed:false,feedback});
 const pass=(feedback:string)=>({passed:true,feedback});
 if(stage===1){
  const targets=[["CD"],["AB","CD"],["BC"]];
  for(let i=0;i<3;i++)if(!same(a.edges?.[i],targets[i]))return fail(`第${i+1}項再試一次：看看兩條邊是否有共同頂點。轉動圖形不會改變相連關係。`);
  if(a.rotation!=="same")return fail("再把圖形轉動一次：邊的名稱和相連關係有改變嗎？");
  return pass("吊橋修好了！鄰邊有共同頂點，對邊沒有；圖形轉動不會改變它們的關係。");
 }
 if(stage===2){
  for(let i=0;i<4;i++){
   if(!["length","angle","parallel"].every(t=>a.tools?.[i]?.includes(t)))return fail(`先對圖形${"ABCD"[i]}使用量邊、直角和平行工具，收集三種證據。`);
   const expected=[[true,true,true,true],[true,false,true,true],[false,true,true,true],[false,false,true,true]][i];
   for(let p=0;p<4;p++)if(a.table?.[i]?.[p]!==String(expected[p]))return fail(`圖形${"ABCD"[i]}的第${p+1}項紀錄需要修正。再用工具檢查相關的邊或角。`);
  }return pass("調查完成！圖形的特性要用量度和檢查來確認。");
 }
 if(stage===3){
  if(!["yes","no"].includes(a.predict))return fail("請先選擇你的預測；預測不同也可以繼續探索。");
  if(![2,3,5].every(w=>a.widths?.includes(w)))return fail("請先把寬度調到2、3、5個單位，分別按「記錄這次觀察」。");
  if(a.width!==3)return fail("再調整寬度，找出四邊等長的箱面，然後停在那個位置。");
  if(a.rectangle!=="yes"||a.reason!=="angles")return fail("檢查正方形的四個角和兩組對邊：它仍然符合長方形的特性嗎？");
  return pass("正方形是特別的長方形：它有四個直角，兩組對邊長度分別相等，而且四邊等長。");
 }
 if(stage===4){
  if(!["yes","no"].includes(a.predict))return fail("請先選擇你的預測；預測不同也可以繼續探索。");
  if(![60,90,120].every(v=>a.angles?.includes(v)))return fail("請先觀察並記錄60°、90°、120°三個位置。");
  if(a.angle!==90||a.rhombus!=="yes"||a.reason!=="equal")return fail("四個角都是直角時，四邊仍然等長。調到90°再檢查一次。");
  return pass("正方形也是特別的菱形。菱形以四邊等長為特性，正方形仍符合這個條件。");
 }
 if(stage===5){
  for(const kind of ["rectangle","rhombus","square"]){
   const s=a.builds?.[kind];if(!s)return fail("請依次製作並記錄長方形、菱形和正方形橋面。");
   if(kind==="rectangle"&&!(s.angle===90&&s.width!==s.side))return fail("請製作一個四個直角、鄰邊長度不同的長方形例子。");
   if(kind==="rhombus"&&!(s.width===s.side&&s.angle!==90))return fail("請製作一個四邊等長、沒有直角的菱形例子。");
   if(kind==="square"&&!(s.width===s.side&&s.angle===90))return fail("正方形橋面需要四邊等長，而且四個角都是直角。");
  }
  if(!same(a.shared,["opposite","parallel"]))return fail("比較三款橋面：是否每一款都有四邊等長？是否每一款都有四個直角？再選共同特性。");
  return pass("長方形、菱形和正方形都有兩組對邊分別平行、分別等長，因此都屬於平行四邊形家族。");
 }
 if(stage===6){
  const zones={square:1,rectangle:0,rhombus:2,parallel:3,trapezoid:4};
  for(const c of cards)if(Number(a.zones?.[c.id])!==zones[c.kind])return fail(`圖形${c.id}的位置需要再想一想。旋轉不會改變特性；正方形同時屬於長方形和菱形。`);
  if(a.allSquares!=="yes"||a.allRectangles!=="no")return fail("想想一個鄰邊不等長的長方形：它能作為反例嗎？");
  return pass("家族地圖重建了！所有正方形都是長方形和菱形，但並非所有長方形或菱形都是正方形。");
 }
 if(stage===7){
  const sets=[["A","B","E","F"],["A","C","E"],["A","B","C","D","E","F"]];
  for(let i=0;i<3;i++)if(!same(a.selected?.[i],sets[i]))return fail(`工程任務${i+1}還有圖形漏選或多選。逐個檢查，選出所有符合條件的圖形。`);
  if(a.reverse!=="no"||a.explain!=="both")return fail("長方形未必四邊等長；正方形則同時有四個直角和四邊等長。再整理你的解釋。");
  return pass("救援成功！你能用特性判斷圖形，而不只依靠名稱、大小或擺放方向。");
 }return fail("找不到這個關卡。");
}
export function canEnter(stage:number,completed:number,opened:number,paused:number){return Number.isInteger(stage)&&stage>=1&&stage<=7&&!paused&&stage<=opened&&stage<=completed+1;}
