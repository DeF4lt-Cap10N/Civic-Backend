const base = 'https://523cc774d18e4cf8a55d7817e2da9829-dbc03f253f7f4be896ed9acb9.fly.dev';
const ts = Date.now();
const citizenEmail = `citizen+${ts}@example.com`;
const staffEmail = `staff+${ts}@example.com`;
const adminEmail = `admin+${ts}@example.com`;
const password = 'pass12345';

async function post(path, body, headers={}){
  const res = await fetch(base+path, { method:'POST', headers:{ 'Content-Type':'application/json', ...headers }, body: JSON.stringify(body) });
  const j = await res.json().catch(()=>({}));
  return { ok: res.ok, j, status: res.status };
}
async function get(path, headers={}){
  const res = await fetch(base+path, { headers });
  const j = await res.json().catch(()=>({}));
  return { ok: res.ok, j, status: res.status };
}

(async () => {
  // Signup users
  let r = await post('/api/auth/signup', { name:'Citizen', email: citizenEmail, password });
  if (!r.ok) throw new Error('Citizen signup: '+JSON.stringify(r.j));
  const citizenId = r.j.user.id;

  let staff = await post('/api/auth/signup', { name:'Staff User', email: staffEmail, password });
  if (!staff.ok) throw new Error('Staff signup: '+JSON.stringify(staff.j));
  const staffId = staff.j.user.id;

  let adm = await post('/api/auth/signup', { name:'Admin User', email: adminEmail, password });
  if (!adm.ok) throw new Error('Admin signup: '+JSON.stringify(adm.j));

  // Promote admin
  let res = await fetch(base+'/api/admin/promote', { method:'POST', headers:{ 'Content-Type':'application/json', 'X-Admin-Seed':'bootstrap-admin-2025' }, body: JSON.stringify({ email: adminEmail })});
  let body = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error('Promote admin: '+JSON.stringify(body));

  // Login tokens
  r = await post('/api/auth/login', { email: adminEmail, password });
  if (!r.ok) throw new Error('Admin login: '+JSON.stringify(r.j));
  const adminToken = r.j.token;

  r = await post('/api/auth/login', { email: citizenEmail, password });
  if (!r.ok) throw new Error('Citizen login: '+JSON.stringify(r.j));
  const citizenToken = r.j.token;

  // Create department with staff included (sets role to staff)
  let depRes = await fetch(base+'/api/departments', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+adminToken }, body: JSON.stringify({ name: 'Roads '+ts, description: 'Road maintenance', staff: [staffId] })});
  let dep = await depRes.json().catch(()=>({}));
  if (!depRes.ok) throw new Error('Department create: '+JSON.stringify(dep));
  const deptId = dep._id;

  // Create report with image (multipart) + lat/lng
  const form = new FormData();
  form.append('title','Streetlight broken');
  form.append('description','Lamp not working near park');
  form.append('category','lighting');
  form.append('lat','12.97');
  form.append('lng','77.59');
  const blob = new Blob([Buffer.from('fakepng')], { type:'image/png' });
  form.append('photo', blob, 'photo.png');
  let repRes = await fetch(base+'/api/reports', { method:'POST', headers:{ 'Authorization':'Bearer '+citizenToken }, body: form });
  let rep = await repRes.json().catch(()=>({}));
  if (!repRes.ok) throw new Error('Report create: '+JSON.stringify(rep));
  const reportId = rep._id;

  // Assign to dept + staff
  let asg = await fetch(base+'/api/reports/'+reportId+'/assign', { method:'PUT', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+adminToken }, body: JSON.stringify({ departmentId: deptId, staffId }) });
  let asgJ = await asg.json().catch(()=>({}));
  if (!asg.ok) throw new Error('Assign: '+JSON.stringify(asgJ));

  // Status transitions
  let st = await fetch(base+'/api/reports/'+reportId+'/status', { method:'PUT', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+adminToken }, body: JSON.stringify({ status:'acknowledged' }) });
  if (!st.ok) throw new Error('Status ack: '+JSON.stringify(await st.json().catch(()=>({}))));
  st = await fetch(base+'/api/reports/'+reportId+'/status', { method:'PUT', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+adminToken }, body: JSON.stringify({ status:'resolved' }) });
  if (!st.ok) throw new Error('Status resolved: '+JSON.stringify(await st.json().catch(()=>({}))));

  // Analytics
  const sum = await get('/api/analytics/summary', { 'Authorization':'Bearer '+adminToken });
  const tr = await get('/api/analytics/trends?granularity=daily', { 'Authorization':'Bearer '+adminToken });
  const hm = await get('/api/analytics/heatmap', { 'Authorization':'Bearer '+adminToken });

  // Citizen reports
  const my = await get('/api/reports/my', { 'Authorization':'Bearer '+citizenToken });

  // Verify photo url
  let photoStatus = null;
  if (rep.photoUrl) {
    const u = rep.photoUrl.startsWith('http') ? rep.photoUrl : base + rep.photoUrl;
    const img = await fetch(u);
    photoStatus = img.status;
  }

  console.log(JSON.stringify({ deptId, staffId, reportId, photoUrl: rep.photoUrl, photoStatus, summary: sum.j, trends: tr.j, heatmap: hm.j, myCount: my.j.length }));
})();
