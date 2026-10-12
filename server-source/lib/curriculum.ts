export const stages = [
  {title:"修復竹林吊橋", short:"找出鄰邊與對邊", icon:"bridge", story:"吊橋的支架散開了！找出相連的邊和相對的邊，把橋接起來。", question:"圖形轉動後，鄰邊和對邊會改變嗎？", hint:"鄰邊有共同頂點；對邊沒有共同頂點。"},
  {title:"幾何偵察站",short:"量度・檢查・記錄",icon:"search",story:"救援箱上的圖形名稱不見了。先用工具收集證據，再填寫調查表。",question:"你怎樣知道它有這個特性？",hint:"逐一量四條邊，再檢查四個角及兩組對邊。"},
  {title:"補給箱工場",short:"長方形與正方形",icon:"box",story:"熊貓需要不同大小的補給箱。改變箱面的寬度，找出四邊等長的時刻。",question:"變成正方形後，它還是長方形嗎？",hint:"變形後，再檢查四個角和兩組對邊。"},
  {title:"菱形能源門",short:"菱形與正方形",icon:"diamond",story:"能源門的四條邊一樣長。調整角度，找出能啟動能源的位置！",question:"菱形一定是斜斜的、沒有直角嗎？",hint:"試把角度調到90°。四條邊的長度有改變嗎？"},
  {title:"平行四邊形運輸橋",short:"探索共同特性",icon:"route",story:"兩組對邊平行的橋面能穩定運輸。改變邊長和角度，製作三款特別橋面。",question:"哪些特性是這些圖形共有的？",hint:"長方形要四個直角；菱形要四邊等長；正方形同時符合兩者。"},
  {title:"重建家族地圖",short:"整理圖形的關係",icon:"map",story:"導航系統需要正確的家族地圖。同一個圖形可能有多個家族身分！",question:"正方形應放在哪個重疊的位置？",hint:"先檢查直角和等邊。長方形與菱形共同的部分是正方形。"},
  {title:"熊貓救援總任務",short:"選取所有符合的圖形",icon:"flag",story:"最後一批物資就要出發！依照工程條件，選出所有可以使用的圖形。",question:"你能用特性解釋自己的選擇嗎？",hint:"不要只看名稱和擺放方向，逐個檢查條件。"},
];
export const propNames = ["四個角都是直角","四邊長度相等","兩組對邊長度分別相等","兩組對邊分別平行"];
export type ShapeKind = "square"|"rectangle"|"rhombus"|"parallel"|"trapezoid";
export const shapeNames:Record<ShapeKind,string>={square:"正方形",rectangle:"長方形",rhombus:"菱形",parallel:"平行四邊形",trapezoid:"梯形"};
export const cards:{id:string;kind:ShapeKind;rotation:number;label:string}[]=[
 {id:"A",kind:"square",rotation:0,label:"A"},{id:"B",kind:"rectangle",rotation:0,label:"B"},
 {id:"C",kind:"rhombus",rotation:0,label:"C"},{id:"D",kind:"parallel",rotation:0,label:"D"},
 {id:"E",kind:"square",rotation:45,label:"E"},{id:"F",kind:"rectangle",rotation:90,label:"F"},
 {id:"G",kind:"trapezoid",rotation:0,label:"G"},
];
export const familyOptions=["長方形區","長方形與菱形重疊區","菱形區","只屬於平行四邊形區","平行四邊形以外"];
export const edgeTasks=[{base:"AB",relation:"opposite",label:"找出AB的對邊",rotation:0},{base:"BC",relation:"neighbor",label:"選出BC的兩條鄰邊",rotation:30},{base:"DA",relation:"opposite",label:"圖形轉動了！找出DA的對邊",rotation:-25}];
