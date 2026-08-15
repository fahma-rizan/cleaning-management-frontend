import{c as b,r as o,j as e,M as O,d as S,L as F,t as Y,h as _}from"./index-BTCrt-Vx.js";import{D as V,X as $}from"./DemoTopBar-CJ2jn2lB.js";import{S as T}from"./send-BgZ67kqu.js";import"./package-C3C__6k9.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],U=b("chevron-down",z);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],q=b("chevron-up",W);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],R=b("copy",G),y=[{id:"booking-confirmed",category:"Booking",subject:"Your Booking is Confirmed! — Cloud Laundry.lk",trigger:"Sent automatically when booking is placed",body:`Dear {{customer_name}},

Thank you for choosing Cloud Laundry.lk! Your booking has been confirmed.

BOOKING DETAILS
───────────────────────────────
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Date & Time    : {{service_date}} at {{service_time}}
Address        : {{address}}
───────────────────────────────

PAYMENT SUMMARY
Amount Paid    : Rs. {{paid_amount}}
Balance Due    : Rs. {{balance_amount}}
Payment Method : {{payment_method}}

Our team will arrive at your location at the scheduled time.

If you have any questions, call us at +94 11 234 5678.

Warm regards,
Cloud Laundry.lk Team`},{id:"payment-received",category:"Payment",subject:"Payment Received — Invoice #{{invoice_number}}",trigger:"Sent when payment is successfully processed",body:`Dear {{customer_name}},

We have received your payment. Thank you!

INVOICE SUMMARY
───────────────────────────────
Invoice No.    : {{invoice_number}}
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Amount Paid    : Rs. {{paid_amount}}
Payment Method : {{payment_method}}
Date           : {{payment_date}}
───────────────────────────────

Thank you for trusting Cloud Laundry.lk!

Best regards,
Cloud Laundry.lk Billing Team`},{id:"service-reminder",category:"Reminder",subject:"Reminder: Your Service is Tomorrow — Cloud Laundry.lk",trigger:"Sent automatically 24 hours before service",body:`Dear {{customer_name}},

Your cleaning service is scheduled for tomorrow!

SERVICE DETAILS
───────────────────────────────
Service        : {{service_name}}
Date           : {{service_date}}
Time           : {{service_time}}
Address        : {{address}}
Booking ID     : {{booking_id}}
───────────────────────────────

Need to reschedule? Call us at least 4 hours before: +94 11 234 5678.

See you tomorrow!
Cloud Laundry.lk Team`},{id:"balance-due",category:"Reminder",subject:"Balance Payment Due — Cloud Laundry.lk",trigger:"Sent when balance remains unpaid after service",body:`Dear {{customer_name}},

Your service is complete. The remaining balance is now due.

BALANCE DETAILS
───────────────────────────────
Booking ID     : {{booking_id}}
Service        : {{service_name}}
Balance Due    : Rs. {{balance_amount}}
Advance Paid   : Rs. {{paid_amount}}
───────────────────────────────

Please pay your balance at: {{payment_link}}

Cloud Laundry.lk Team`},{id:"refund-initiated",category:"Refund",subject:"Refund Initiated — Rs. {{refund_amount}} — Cloud Laundry.lk",trigger:"Sent when a refund is processed",body:`Dear {{customer_name}},

Your refund has been processed successfully.

REFUND DETAILS
───────────────────────────────
Refund Amount  : Rs. {{refund_amount}}
Booking ID     : {{booking_id}}
Reason         : {{refund_reason}}
Reference No.  : {{refund_reference}}
───────────────────────────────

Your refund will appear in your account within 5-7 business days.

Cloud Laundry.lk Support Team
+94 11 234 5678`},{id:"promotion",category:"Marketing",subject:"Special Offer Just for You — {{discount}}% Off!",trigger:"Sent manually by admin for promotions",body:`Dear {{customer_name}},

We have an exclusive offer just for you!

{{discount}}% OFF on all {{service_category}} services
Valid: {{promo_start}} to {{promo_end}}
Code: {{promo_code}}

Book now at cloudlaundry.lk or call +94 11 234 5678.

Cloud Laundry.lk Team`},{id:"re-clean-reminder",category:"Recommendation",subject:"Time for a Re-Clean? — Cloud Laundry.lk",trigger:"Sent 30 days after last service",body:`Dear {{customer_name}},

It has been {{days_since}} days since your last {{service_name}}.

Most customers schedule a re-clean every 30 days.

Book now and use code RE-CLEAN10 for 10% off.

cloudlaundry.lk | +94 11 234 5678

Cloud Laundry.lk Team`}],J={Booking:"bg-green-100 text-green-700",Payment:"bg-blue-100 text-blue-700",Reminder:"bg-yellow-100 text-yellow-700",Refund:"bg-red-100 text-red-700",Marketing:"bg-pink-100 text-pink-700",Recommendation:"bg-indigo-100 text-indigo-700"},h=d=>[...new Set((d.match(/\{\{(\w+)\}\}/g)||[]).map(n=>n.slice(2,-2)))],E=(d,n)=>d.replace(/\{\{(\w+)\}\}/g,(f,l)=>n[l]||`{{${l}}}`);function Z({user:d}){const[n,f]=o.useState("booking-confirmed"),[l,j]=o.useState(null),[m,D]=o.useState("All"),[r,v]=o.useState(null),[i,w]=o.useState(""),[c,N]=o.useState({}),[u,x]=o.useState(!1),L=["All",...Array.from(new Set(y.map(s=>s.category)))],g=m==="All"?y:y.filter(s=>s.category===m),k=(s,a)=>{navigator.clipboard.writeText(a),j(s),setTimeout(()=>j(null),2e3)},A=s=>{v(s),w("");const a=h(s.body+" "+s.subject);N(Object.fromEntries(a.map(t=>[t,""])))},p=()=>{v(null),x(!1)},I=async()=>{if(!r||!i)return;x(!0);const s=Y.getTokens(),a=s?.accessToken?{Authorization:`Bearer ${s.accessToken}`}:{};try{const t=await fetch("http://localhost:4000/api/email/send",{method:"POST",headers:{"Content-Type":"application/json",...a},body:JSON.stringify({templateId:r.id,to:i,variables:c})});if(!t.ok){const P=await t.json();throw new Error(P.message||"Failed to send email.")}_.success(`Email sent to ${i}`),p()}catch(t){_.error(t.message||"Failed to send email.")}finally{x(!1)}},C=r?h(r.body+" "+r.subject):[],B=r?E(r.subject,c):"",M=r?E(r.body,c):"";return e.jsxs("div",{className:"min-h-screen bg-gray-50",children:[e.jsx(V,{user:d}),e.jsxs("div",{className:"container mx-auto px-4 py-8 max-w-4xl",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx("div",{className:"bg-purple-600 p-2 rounded-lg",children:e.jsx(O,{className:"w-6 h-6 text-white"})}),e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:"Email Templates"})]}),e.jsx("p",{className:"text-gray-500",children:"Ready-made templates for all customer communications. Copy or send directly from here."})]}),e.jsx("div",{className:"flex flex-wrap gap-2 mb-6",children:L.map(s=>e.jsx("button",{onClick:()=>D(s),className:`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${m===s?"bg-purple-600 text-white":"bg-white text-gray-600 border border-gray-200 hover:border-purple-300"}`,children:s},s))}),e.jsx("div",{className:"space-y-4",children:g.map(s=>e.jsxs("div",{className:"bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",children:[e.jsxs("button",{type:"button",onClick:()=>f(n===s.id?null:s.id),className:"w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:`text-xs px-2 py-1 rounded-full font-medium ${J[s.category]||"bg-gray-100 text-gray-600"}`,children:s.category}),e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold text-gray-900 text-sm",children:s.subject}),e.jsx("p",{className:"text-xs text-gray-400 mt-0.5",children:s.trigger})]})]}),n===s.id?e.jsx(q,{className:"w-5 h-5 text-gray-400 flex-shrink-0"}):e.jsx(U,{className:"w-5 h-5 text-gray-400 flex-shrink-0"})]}),n===s.id&&e.jsxs("div",{className:"border-t border-gray-100",children:[e.jsxs("div",{className:"px-5 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-100",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-xs text-gray-400 uppercase tracking-wide mr-2",children:"Subject:"}),e.jsx("span",{className:"text-sm font-medium text-gray-700",children:s.subject})]}),e.jsx("button",{onClick:()=>k(s.id+"-subject",s.subject),className:"flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-50 transition-colors",children:l===s.id+"-subject"?e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"w-3.5 h-3.5"})," Copied!"]}):e.jsxs(e.Fragment,{children:[e.jsx(R,{className:"w-3.5 h-3.5"})," Copy"]})})]}),e.jsxs("div",{className:"relative",children:[e.jsx("pre",{className:"p-5 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed bg-white overflow-x-auto",children:s.body}),e.jsxs("div",{className:"absolute top-3 right-3 flex gap-2",children:[e.jsx("button",{onClick:()=>k(s.id,s.body),className:"flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-300 px-3 py-1.5 rounded-lg shadow-sm transition-colors",children:l===s.id?e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"w-3.5 h-3.5 text-green-500"})," Copied!"]}):e.jsxs(e.Fragment,{children:[e.jsx(R,{className:"w-3.5 h-3.5"})," Copy"]})}),e.jsxs("button",{onClick:()=>A(s),className:"flex items-center gap-1.5 text-xs bg-purple-600 text-white hover:bg-purple-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors",children:[e.jsx(T,{className:"w-3.5 h-3.5"})," Send"]})]})]}),e.jsxs("div",{className:"px-5 py-3 bg-gray-50 border-t border-gray-100",children:[e.jsx("p",{className:"text-xs text-gray-500 mb-2 font-medium",children:"Variables in this template:"}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:h(s.body+" "+s.subject).map(a=>e.jsx("code",{className:"text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono",children:`{{${a}}}`},a))})]})]})]},s.id))}),e.jsxs("p",{className:"text-center text-xs text-gray-400 mt-8",children:[g.length," template",g.length!==1?"s":""," — Cloud Laundry.lk"]})]}),r&&e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"16px"},children:e.jsxs("div",{className:"bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between p-6 border-b border-gray-100",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg font-semibold text-gray-900",children:"Send Email"}),e.jsxs("p",{className:"text-sm text-gray-500 mt-0.5",children:["Template: ",r.id]})]}),e.jsx("button",{onClick:p,className:"p-2 hover:bg-gray-100 rounded-lg",children:e.jsx($,{className:"w-5 h-5 text-gray-500"})})]}),e.jsxs("div",{className:"p-6 space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Recipient Email *"}),e.jsx("input",{type:"email",value:i,onChange:s=>w(s.target.value),placeholder:"customer@example.com",className:"w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"})]}),C.length>0&&e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-700 mb-3",children:"Fill in template variables:"}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:C.map(s=>e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-medium text-gray-600 mb-1",children:e.jsx("code",{className:"bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs",children:`{{${s}}}`})}),e.jsx("input",{type:"text",value:c[s]||"",onChange:a=>N(t=>({...t,[s]:a.target.value})),placeholder:s.replace(/_/g," "),className:"w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"})]},s))})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-700 mb-2",children:"Preview:"}),e.jsxs("div",{className:"border border-gray-200 rounded-lg overflow-hidden",children:[e.jsxs("div",{className:"bg-gray-50 px-4 py-2 border-b border-gray-200",children:[e.jsx("span",{className:"text-xs text-gray-500",children:"Subject: "}),e.jsx("span",{className:"text-xs text-gray-800 font-medium",children:B})]}),e.jsx("pre",{className:"p-4 text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-white",children:M})]})]}),e.jsxs("div",{className:"flex gap-3 pt-2",children:[e.jsx("button",{onClick:p,className:"flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium",children:"Cancel"}),e.jsx("button",{onClick:I,disabled:!i||u,className:`flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all ${!i||u?"bg-purple-300 cursor-not-allowed":"bg-purple-600 hover:bg-purple-700"}`,children:u?e.jsxs(e.Fragment,{children:[e.jsx(F,{className:"w-4 h-4 animate-spin"})," Sending..."]}):e.jsxs(e.Fragment,{children:[e.jsx(T,{className:"w-4 h-4"})," Send Email"]})})]})]})]})})]})}export{Z as default};
