const base = 'https://523cc774d18e4cf8a55d7817e2da9829-dbc03f253f7f4be896ed9acb9.fly.dev';
const ts = Date.now();
const citizenEmail = `c+${ts}@ex.com`;
const staffEmail = `s+${ts}@ex.com`;
const adminEmail = `a+${ts}@ex.com`;
const password = 'p@55w0rd';
async function post(p,b,h={}){const r=await fetch(base+p,{method:'POST',headers:{'Content-Type':'application/json',...h},body:JSON.stringify(b)});return{ok:r.ok,j:await r.json().catch(()=>({}))}}
async function get(p,h={}){const r=await fetch(base+p,{headers:h});return{ok:r.ok,j:await r.json().catch(()=>({}))}}
(async()=>{
  let r=await post('/api/auth/signup',{name:'C',email:citizenEmail,password}); const citizenToken=(await post('/api/auth/login',{email:citizenEmail,password})).j.token;
  let s=await post('/api/auth/signup',{name:'S',email:staffEmail,password}); const staffId=s.j.user.id;
  await post('/api/auth/signup',{name:'A',email:adminEmail,password}); await fetch(base+'/api/admin/promote',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Seed':'bootstrap-admin-2025'},body:JSON.stringify({email:adminEmail})}); const adminToken=(await post('/api/auth/login',{email:adminEmail,password})).j.token;
  const dep=await fetch(base+'/api/departments',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+adminToken},body:JSON.stringify({name:'Roads '+ts,staff:[staffId]})}); const deptId=(await dep.json())._id;
  const f=new FormData(); f.append('title','Test'); f.append('description','D'); f.append('category','roads'); f.append('lat','12.97'); f.append('lng','77.59'); f.append('photo', new Blob([Buffer.from('x')],{type:'image/png'}), 'p.png');
  const rep=await fetch(base+'/api/reports',{method:'POST',headers:{'Authorization':'Bearer '+citizenToken},body:f}); const jr=await rep.json(); const reportId=jr._id; const photoUrl=jr.photoUrl; await fetch(base+`/api/reports/${reportId}/assign`,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+adminToken},body:JSON.stringify({departmentId:deptId,staffId})}); await fetch(base+`/api/reports/${reportId}/status`,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+adminToken},body:JSON.stringify({status:'resolved'})});
  const sum=(await get('/api/analytics/summary',{'Authorization':'Bearer '+adminToken})).j; const tr=(await get('/api/analytics/trends',{'Authorization':'Bearer '+adminToken})).j; const hm=(await get('/api/analytics/heatmap',{'Authorization':'Bearer '+adminToken})).j; const my=(await get('/api/reports/my',{'Authorization':'Bearer '+citizenToken})).j; let ps=null; if(photoUrl){ const u=photoUrl.startsWith('http')?photoUrl:base+photoUrl; ps=(await fetch(u)).status }
  console.log(JSON.stringify({deptId,staffId,reportId,photoStatus:ps,summary:sum,counts:{trends:tr.length,heatmap:hm.length,my:my.length}}));
})()
