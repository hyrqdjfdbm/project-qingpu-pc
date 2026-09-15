import{m as g}from"./delay-D3FmRICF.js";function l(e){return String(e).padStart(2,"0")}function a(e){return`${e.getFullYear()}-${l(e.getMonth()+1)}-${l(e.getDate())} ${l(e.getHours())}:${l(e.getMinutes())}:${l(e.getSeconds())}`}function $(e){return{...e}}function F(e,t){return a(new Date(e,t-1,2,9,0,0))}function R(e,t){const n=t*3,o=new Date(e,n,0).getDate();return a(new Date(e,n-1,o,18,0,0))}function p(e){return a(new Date(e,11,31,18,0,0))}function d(e){let t=0;for(let n=0;n<e.length;n+=1)t=t*31+e.charCodeAt(n)>>>0;return 18e4+t%42e4}function A(e,t){const n=`${e}年${t}月`;return{id:`ryf-${e}-${l(t)}`,type:"red_yellow_flag",periodLabel:n,year:e,month:t,fileName:`红黄旗评分表_${e}年${l(t)}月.pdf`,fileSize:d(`ryf-${e}-${t}`),generatedAt:F(e,t),generateRule:"每月2日系统自动生成并存档"}}function j(e,t){const o=["一季度","二季度","三季度","四季度"][t-1],r=`${e}年${o}`;return{id:`qtr-${e}-Q${t}`,type:"quarterly",periodLabel:r,year:e,quarter:t,fileName:`季度考核评分表_${e}年${o}.pdf`,fileSize:d(`qtr-${e}-${t}`),generatedAt:R(e,t),generateRule:"每季度末系统自动生成并存档"}}function D(e){const t=`${e}年度`;return{id:`year-${e}`,type:"annual",periodLabel:t,year:e,fileName:`年度考核评分表_${e}年.pdf`,fileSize:d(`year-${e}`),generatedAt:p(e),generateRule:"每年末系统自动生成并存档"}}function y(e=new Date){const t=[],n=new Date(e.getFullYear(),e.getMonth(),e.getDate());for(let o=0;o<14;o+=1){const r=new Date(e.getFullYear(),e.getMonth()-o,1),i=r.getFullYear(),u=r.getMonth()+1,c=new Date(i,u-1,2);n>=c&&t.push(A(i,u))}for(let o=0;o<8;o+=1){const r=e.getFullYear()*4+Math.floor(e.getMonth()/3)-o,i=Math.floor(r/4),u=r%4+1,c=u*3,b=new Date(i,c,0).getDate(),h=new Date(i,c-1,b);n>=h&&t.push(j(i,u))}for(let o=1;o<=3;o+=1){const r=e.getFullYear()-o;t.push(D(r))}return n>=new Date(e.getFullYear(),11,31)&&t.push(D(e.getFullYear())),t}const f=y();function w(e,t){if(!(t!=null&&t.trim()))return!0;const n=t.trim().toLowerCase();return e.periodLabel.toLowerCase().includes(n)||e.fileName.toLowerCase().includes(n)||e.generateRule.toLowerCase().includes(n)}const s={list(e){let t=f.map($);return e!=null&&e.type&&(t=t.filter(n=>n.type===e.type)),(e==null?void 0:e.category)==="annual"?t=t.filter(n=>n.type==="annual"):(e==null?void 0:e.category)==="quarterly"&&(t=t.filter(n=>n.type==="quarterly")),(e==null?void 0:e.year)!=null&&(t=t.filter(n=>n.year===e.year)),e!=null&&e.keyword&&(t=t.filter(n=>w(n,e.keyword))),t.sort((n,o)=>n.generatedAt<o.generatedAt?1:-1)},getById(e){const t=f.find(n=>n.id===e);return t?$(t):void 0},ensureGenerated(e=new Date){const t=y(e);for(const n of t)f.some(o=>o.id===n.id)||f.push(n)},types(){return["red_yellow_flag","annual","quarterly"]}},T={list:e=>(s.ensureGenerated(),g(s.list(e))),getById:e=>{const t=s.getById(e);return t?g(t):Promise.reject(new Error("考核文档不存在"))}};function B(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function L(e,t){const o=`%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 88>>stream
BT /F1 14 Tf 72 720 Td (Assessment: ${S(`${t} ${e}`)}) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000220 00000 n
0000000356 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
423
%%EOF`;return URL.createObjectURL(new Blob([o],{type:"application/pdf"}))}function S(e){return e.replace(/[\\()]/g,"\\$&").slice(0,80)}function C(e){const t=L(e.fileName,e.periodLabel),n=document.createElement("a");n.href=t,n.download=e.fileName,n.rel="noopener",document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(t)}export{T as a,C as d,B as f};
