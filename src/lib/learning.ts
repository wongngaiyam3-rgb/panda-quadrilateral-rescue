import {cards,edgeTasks,propNames} from './curriculum';
type Answer=Record<string,any>;
export function taskList(stage:number,a:Answer):{label:string;done:boolean}[]{
 if(stage===1)return [...edgeTasks.map((t,i)=>({label:`任務${i+1}：${t.label}`,done:(a.edges?.[i]?.length||0)===(t.relation==='neighbor'?2:1)})),{label:'記錄轉動後的關係',done:!!a.rotation}];
 if(stage===2)return cards.slice(0,4).map((c,i)=>({label:`圖形${c.id}：使用3種工具及填好4項特性`,done:['length','angle','parallel'].every(t=>a.tools?.[i]?.includes(t))&&propNames.every((_,j)=>['true','false'].includes(a.table?.[i]?.[j]))}));
 if(stage===3)return [{label:'先作預測',done:!!a.predict},...[2,3,5].map(v=>({label:`記錄寬度${v}格`,done:!!a.widths?.includes(v)})),{label:'停在四邊等長的位置，選擇判斷及證據',done:a.width===3&&!!a.rectangle&&!!a.reason}];
 if(stage===4)return [{label:'先作預測',done:!!a.predict},...[60,90,120].map(v=>({label:`記錄${v}°的位置`,done:!!a.angles?.includes(v)})),{label:'停在四個直角的位置，選擇判斷及證據',done:a.angle===90&&!!a.rhombus&&!!a.reason}];
 if(stage===5)return [{label:'記錄長方形橋面',done:!!a.builds?.rectangle},{label:'記錄菱形橋面',done:!!a.builds?.rhombus},{label:'記錄正方形橋面',done:!!a.builds?.square},{label:'選出共有的特性',done:!!a.shared?.length}];
 if(stage===6)return [{label:'安置全部7張圖形卡',done:cards.every(c=>a.zones?.[c.id]!==undefined)},{label:'判斷兩句圖形關係',done:!!a.allSquares&&!!a.allRectangles}];
 return [0,1,2].map(i=>({label:`工程${i+1}：選出全部可用圖形`,done:!!a.selected?.[i]?.length})).concat([{label:'完成圖形關係及證據判斷',done:!!a.reverse&&!!a.explain}]);
}
