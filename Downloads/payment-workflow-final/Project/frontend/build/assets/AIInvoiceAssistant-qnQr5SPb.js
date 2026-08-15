import{c as q,a as P,r,j as e,A as U,U as Y,F as J,R as D,d as O,I as $,t as K}from"./index-BTCrt-Vx.js";import{D as V}from"./DemoTopBar-CJ2jn2lB.js";import{S as _}from"./send-BgZ67kqu.js";import"./package-C3C__6k9.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],E=q("bot",G);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],X=q("sparkles",Q),Z=`
You are an invoice assistant for Cloud Laundry.lk, a professional cleaning company in Sri Lanka.

AVAILABLE SERVICES AND PRICING (all prices in Sri Lankan Rupees, LKR):

HOME / OFFICE CLEANING (category: home):
- House Deep Cleaning (per sqft):
    Normal Deep Cleaning: Rs. 25/sqft
    Move In / Move Out: Rs. 30/sqft
    After Construction: Rs. 35/sqft
- Kitchen Deep Cleaning (fixed):
    Small: Rs. 3,000  |  Medium: Rs. 4,000  |  Large: Rs. 5,000
- Bathroom Deep Cleaning: Rs. 2,500 per unit/bathroom

LAUNDRY (category: laundry):
- Laundry Service:
    Wash & Fold: Rs. 450/kg
    Wash & Iron: Rs. 650/kg
    Iron & Hang: Rs. 150/piece

SHAMPOO / VACUUM CLEANING (category: shampoo):
- Sofa Shampooing (per seat): Rs. 800/seat
- Carpet Shampooing (per sqft):
    Normal Carpet: Rs. 35/sqft
    Persian Carpet: Rs. 50/sqft
- Mattress Shampooing (fixed):
    Single: Rs. 2,500  |  Double: Rs. 3,000  |  Queen: Rs. 3,500  |  King: Rs. 4,000
- Chair Shampooing: Rs. 500 per chair

CURTAIN CLEANING (category: curtain):
- Curtain Cleaning:
    On-site Steam Cleaning: Rs. 1,000/piece
    Dry Cleaning: Rs. 800/kg

YOUR JOB:
1. Collect from the user: customer name, email, phone, address, service date, service time, and all service items with quantities/sizes.
2. Calculate prices accurately using the price list above.
3. When you have ALL the information needed, respond with a JSON block (and ONLY a JSON block, no other text) in this exact format:

\`\`\`invoice
{
  "customer": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "address": "..."
  },
  "serviceDate": "YYYY-MM-DD",
  "serviceTime": "HH:MM",
  "items": [
    {
      "name": "House Deep Cleaning — Normal, 1200 sqft",
      "category": "home",
      "price": 30000,
      "quantity": 1,
      "description": "Normal Deep Cleaning @ Rs. 25/sqft × 1200 sqft"
    }
  ],
  "discount": 0,
  "paymentMethod": "cash",
  "notes": "Any special notes"
}
\`\`\`

4. If the user is missing information, ask for ONLY the missing fields — one or two at a time, conversationally.
5. If the user asks to change something, update the invoice and re-output the full JSON block.
6. Always greet the user warmly and be helpful and concise.
7. Do NOT output the JSON block until you have all required fields: customer name, email, phone, address, at least one service item, date, and time.
`,ee=a=>{const i=a.match(/```invoice\s*([\s\S]*?)```/);if(!i)return null;try{return JSON.parse(i[1].trim())}catch{return null}},te=a=>{const i=new Date,I=a.items.reduce((o,d)=>o+d.price*(d.quantity||1),0),k=a.discount||0,v=Math.max(0,I-k),l=new Set;a.items.forEach(o=>{const d=o.category;d==="laundry"?l.add("LND"):d==="curtain"?l.add("CUR"):d==="shampoo"?l.add("SVC"):d==="home"&&l.add("HOC")});const c=Array.from(l),x=c.length>1?"MULTI":c[0]||"SRV",j=i.toISOString().split("T")[0].replace(/-/g,"");return{invoiceNumber:`${x}-${j}-DRAFT`,mainCategories:c,invoiceType:"FULL",date:i.toLocaleDateString(),time:i.toLocaleTimeString(),bookingId:`MANUAL-${Date.now().toString().slice(-6)}`,customer:a.customer,service:{name:a.items[0]?.name||"Cleaning Service",date:a.serviceDate||i.toLocaleDateString(),time:a.serviceTime||i.toLocaleTimeString(),items:a.items.map(o=>({name:o.name,description:o.description,price:o.price,quantity:o.quantity||1}))},pricing:{subtotal:I,discount:k>0?k:void 0,total:v,paidAmount:a.paymentMethod==="cod"?0:v,balanceAmount:a.paymentMethod==="cod"?v:0},paymentMethod:a.paymentMethod==="cod"?"Cash on Delivery":a.paymentMethod==="online"?"Online (PayHere)":"Cash",status:a.paymentMethod==="cod"?"SENT":"PAID"}};function re({user:a}){const i=P(),I="http://localhost:4000/api",[k,v]=r.useState(null),[l,c]=r.useState([]),[x,j]=r.useState(""),[o,d]=r.useState(!1),[S,L]=r.useState(null),[p,C]=r.useState(null),[w,M]=r.useState(!1),[h,A]=r.useState(!1),T=r.useRef(null),F=r.useRef(null);r.useEffect(()=>{T.current?.scrollIntoView({behavior:"smooth"})},[l,o]),r.useEffect(()=>{c([{role:"assistant",content:`Hi! I'm your AI invoice assistant. Just tell me what you need and I'll create the invoice for you.

For example: *"Invoice for Kavya Perera, kavya@email.com, +94771234567, 45 Galle Road Colombo. House deep cleaning 1500 sqft normal, 2 bathrooms. Service on 15th June at 9am. Cash payment."*

Or describe it step by step — I'll ask for anything I'm missing.`}])},[]),r.useEffect(()=>{let t=!0;return(async()=>{try{const g=await(await fetch(`${I}/assistant/status`)).json();if(!t)return;v(!!g.enabled)}catch{if(!t)return;v(!1)}})(),()=>{t=!1}},[]);const N=async t=>{if(!t.trim()||o)return;const u=[...l,{role:"user",content:t}];c(u),j(""),d(!0);try{const b=(await(await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1e3,system:Z,messages:u.map(n=>({role:n.role,content:n.content}))})})).json()).content?.[0]?.text||"Sorry, I could not process that. Please try again.",s=ee(b);s&&(L(s),C(te(s)),A(!1)),c(n=>[...n,{role:"assistant",content:b}])}catch{c(y=>[...y,{role:"assistant",content:"Sorry, something went wrong. Please check your connection and try again."}])}finally{d(!1)}},H=t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),N(x))},W=async()=>{if(!S||!p)return;M(!0);const t=K.getTokens(),u=t?.accessToken?{Authorization:`Bearer ${t.accessToken}`}:{},g=S.items.reduce((n,m)=>n+m.price*(m.quantity||1),0),y=S.discount||0,b=Math.max(0,g-y),s={invoiceType:p.status==="SENT"?"COD":"FULL",bookingId:p.bookingId,customer:S.customer,serviceItems:S.items.map(n=>({name:n.name,price:n.price*(n.quantity||1),quantity:n.quantity||1})),pricing:{basePrice:g,discount:y,total:b},payment:{method:p.paymentMethod,status:p.status,paidAmount:p.pricing.paidAmount,balanceAmount:p.pricing.balanceAmount},status:"active",createdByStaff:a.id};try{const n=await fetch("http://localhost:4000/api/invoices",{method:"POST",headers:{"Content-Type":"application/json",...u},body:JSON.stringify(s)});if(!n.ok){const f=await n.json();throw new Error(f.msg||"Failed to save invoice.")}const m=await n.json();C(f=>f&&{...f,invoiceNumber:m.invoiceNumber}),A(!0),c(f=>[...f,{role:"assistant",content:`Invoice **${m.invoiceNumber}** saved successfully! You can now download it as a PDF or navigate away.`}])}catch(n){c(m=>[...m,{role:"assistant",content:`Failed to save invoice: ${n.message}`}])}finally{M(!1)}},z=()=>{c([{role:"assistant",content:"Invoice cleared. Tell me about the next one!"}]),L(null),C(null),A(!1)},B=t=>t.replace(/```invoice[\s\S]*?```/g,"*(Invoice generated — see preview on the right)*").split(`
`).map((g,y)=>{const b=g.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);return e.jsx("p",{style:{margin:"2px 0",minHeight:"1em"},children:b.map((s,n)=>s.startsWith("**")&&s.endsWith("**")?e.jsx("strong",{children:s.slice(2,-2)},n):s.startsWith("*")&&s.endsWith("*")?e.jsx("em",{children:s.slice(1,-1)},n):s)},y)}),R=!!p;return k===!1?e.jsxs("div",{style:{padding:"40px",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},children:[e.jsx("div",{style:{fontSize:"22px",fontWeight:700},children:"AI Invoice Assistant — Coming Soon"}),e.jsx("div",{style:{maxWidth:800,textAlign:"center",color:"var(--color-text-secondary)"},children:"The AI invoice assistant is currently disabled on this server. Once the AI service is configured, this page will be available."}),e.jsx("button",{onClick:()=>i(-1),style:{padding:"8px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"white"},children:"Back"})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",minHeight:"100vh",background:"var(--color-background-tertiary)"},children:[e.jsx(V,{user:a}),e.jsxs("div",{style:{padding:"16px 24px",borderBottom:"1px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",gap:"12px"},children:[e.jsxs("button",{onClick:()=>i(-1),style:{display:"flex",alignItems:"center",gap:"6px",color:"var(--color-text-secondary)",background:"none",border:"none",cursor:"pointer",fontSize:"14px"},children:[e.jsx(U,{size:16})," Back"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginLeft:"8px"},children:[e.jsx("div",{style:{background:"linear-gradient(135deg, #7c3aed, #a855f7)",borderRadius:"10px",padding:"8px",display:"flex"},children:e.jsx(X,{size:18,color:"white"})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:500,fontSize:"16px",color:"var(--color-text-primary)"},children:"AI Invoice Assistant"}),e.jsx("div",{style:{fontSize:"12px",color:"var(--color-text-tertiary)"},children:"Describe your service — I'll build the invoice"})]})]})]}),e.jsxs("div",{style:{display:"flex",flex:1,overflow:"hidden",gap:0},children:[e.jsxs("div",{style:{width:R?"42%":"100%",maxWidth:R?"520px":"680px",margin:R?"0":"0 auto",display:"flex",flexDirection:"column",borderRight:R?"1px solid var(--color-border-tertiary)":"none",background:"var(--color-background-primary)",transition:"width 0.3s ease"},children:[e.jsxs("div",{style:{flex:1,overflowY:"auto",padding:"20px 16px"},children:[l.map((t,u)=>e.jsxs("div",{style:{display:"flex",gap:"10px",marginBottom:"16px",flexDirection:t.role==="user"?"row-reverse":"row",alignItems:"flex-start"},children:[e.jsx("div",{style:{flexShrink:0,width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:t.role==="assistant"?"linear-gradient(135deg, #7c3aed, #a855f7)":"var(--color-background-tertiary)"},children:t.role==="assistant"?e.jsx(E,{size:16,color:"white"}):e.jsx(Y,{size:16,color:"var(--color-text-secondary)"})}),e.jsx("div",{style:{maxWidth:"80%",padding:"10px 14px",borderRadius:t.role==="assistant"?"4px 14px 14px 14px":"14px 4px 14px 14px",background:t.role==="assistant"?"var(--color-background-secondary)":"linear-gradient(135deg, #7c3aed, #a855f7)",color:t.role==="user"?"white":"var(--color-text-primary)",fontSize:"13px",lineHeight:"1.6",border:t.role==="assistant"?"1px solid var(--color-border-tertiary)":"none"},children:B(t.content)})]},u)),o&&e.jsxs("div",{style:{display:"flex",gap:"10px",marginBottom:"16px",alignItems:"flex-start"},children:[e.jsx("div",{style:{flexShrink:0,width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg, #7c3aed, #a855f7)"},children:e.jsx(E,{size:16,color:"white"})}),e.jsx("div",{style:{padding:"12px 16px",background:"var(--color-background-secondary)",borderRadius:"4px 14px 14px 14px",border:"1px solid var(--color-border-tertiary)",display:"flex",gap:"4px",alignItems:"center"},children:[0,1,2].map(t=>e.jsx("div",{style:{width:"6px",height:"6px",borderRadius:"50%",background:"#7c3aed",opacity:.6,animation:`pulse 1.2s ease-in-out ${t*.2}s infinite`}},t))})]}),e.jsx("div",{ref:T})]}),l.length===1&&e.jsx("div",{style:{padding:"0 16px 12px",display:"flex",gap:"8px",flexWrap:"wrap"},children:["House deep cleaning 1500 sqft","3 sofa seats + carpet 200sqft","10kg laundry wash and iron","Curtain cleaning 5 pieces"].map(t=>e.jsx("button",{onClick:()=>N(t),style:{padding:"6px 12px",borderRadius:"20px",border:"1px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",fontSize:"12px",cursor:"pointer",whiteSpace:"nowrap"},children:t},t))}),e.jsxs("div",{style:{padding:"12px 16px",borderTop:"1px solid var(--color-border-tertiary)",display:"flex",gap:"10px",alignItems:"flex-end"},children:[e.jsx("textarea",{ref:F,value:x,onChange:t=>j(t.target.value),onKeyDown:H,disabled:o||h,placeholder:h?"Invoice saved. Start a new one?":"Type your message… (Enter to send, Shift+Enter for new line)",rows:2,style:{flex:1,resize:"none",border:"1px solid var(--color-border-secondary)",borderRadius:"10px",padding:"10px 14px",fontSize:"13px",background:"var(--color-background-secondary)",color:"var(--color-text-primary)",outline:"none",lineHeight:"1.5",opacity:o||h?.6:1}}),e.jsx("button",{onClick:()=>N(x),disabled:!x.trim()||o||h,style:{width:"40px",height:"40px",borderRadius:"10px",background:!x.trim()||o||h?"var(--color-background-tertiary)":"linear-gradient(135deg, #7c3aed, #a855f7)",border:"none",cursor:!x.trim()||o||h?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx(_,{size:16,color:!x.trim()||o||h?"var(--color-text-tertiary)":"white"})})]})]}),p&&e.jsxs("div",{style:{flex:1,overflowY:"auto",padding:"20px",background:"var(--color-background-tertiary)"},children:[e.jsxs("div",{style:{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"},children:[e.jsxs("div",{style:{flex:1,fontWeight:500,fontSize:"14px",color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(J,{size:16}),"Invoice Preview",e.jsx("span",{style:{fontSize:"11px",background:"#FAEEDA",color:"#854F0B",padding:"2px 8px",borderRadius:"20px"},children:"DRAFT"})]}),h?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",color:"#3B6D11",fontSize:"13px",fontWeight:500},children:[e.jsx(O,{size:16})," Saved"]}),e.jsx("button",{onClick:z,style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg, #7c3aed, #a855f7)",color:"white",fontSize:"13px",cursor:"pointer"},children:"New Invoice"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:z,style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",border:"1px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",fontSize:"13px",cursor:"pointer"},children:[e.jsx(D,{size:14})," Start Over"]}),e.jsx("button",{onClick:W,disabled:w,style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"8px",border:"none",background:w?"#a78bfa":"linear-gradient(135deg, #7c3aed, #a855f7)",color:"white",fontSize:"13px",fontWeight:500,cursor:w?"not-allowed":"pointer"},children:w?e.jsxs(e.Fragment,{children:[e.jsx(D,{size:14,style:{animation:"spin 1s linear infinite"}})," Saving..."]}):e.jsxs(e.Fragment,{children:[e.jsx(O,{size:14})," Save Invoice"]})})]})]}),e.jsx($,{invoice:p})]})]}),e.jsx("style",{children:`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `})]})}export{re as default};
