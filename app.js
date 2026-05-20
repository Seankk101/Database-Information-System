let students = [
  { id:'S001', name:'Alice Mwangi',   email:'alice@edu.ke',   course:'CS101', gpa:3.8, status:'active' },
  { id:'S002', name:'Brian Otieno',   email:'brian@edu.ke',   course:'IT202', gpa:2.9, status:'active' },
  { id:'S003', name:'Carol Njeri',    email:'carol@edu.ke',   course:'CS101', gpa:1.7, status:'probation' },
  { id:'S004', name:'David Kamau',    email:'david@edu.ke',   course:'NET301', gpa:3.5, status:'active' },
  { id:'S005', name:'Esther Wanjiku', email:'esther@edu.ke',  course:'IT202', gpa:3.9, status:'active' },
  { id:'S006', name:'Frank Mutua',    email:'frank@edu.ke',   course:'DB401', gpa:2.1, status:'inactive' },
  { id:'S007', name:'Grace Akinyi',   email:'grace@edu.ke',   course:'CS101', gpa:3.6, status:'active' },
  { id:'S008', name:'Henry Odhiambo', email:'henry@edu.ke',   course:'NET301', gpa:1.5, status:'probation' },
];

let courses = [
  { code:'CS101',  name:'Computer Science Fundamentals', dept:'ICT',       credits:4, enrolled:3 },
  { code:'IT202',  name:'Information Technology',        dept:'ICT',       credits:3, enrolled:2 },
  { code:'NET301', name:'Network Administration',        dept:'Networking', credits:4, enrolled:2 },
  { code:'DB401',  name:'Database Systems',              dept:'ICT',       credits:3, enrolled:1 },
];

let grades = [
  { studentId:'S001', course:'CS101', assignment:'Midterm',  score:88, date:'2026-03-15' },
  { studentId:'S001', course:'CS101', assignment:'Final',    score:92, date:'2026-05-10' },
  { studentId:'S002', course:'IT202', assignment:'Midterm',  score:71, date:'2026-03-15' },
  { studentId:'S003', course:'CS101', assignment:'Midterm',  score:45, date:'2026-03-15' },
  { studentId:'S004', course:'NET301', assignment:'Project', score:85, date:'2026-04-20' },
  { studentId:'S005', course:'IT202', assignment:'Final',    score:95, date:'2026-05-10' },
];

let nextStudentId = 9;
let enrollChart, gradeChart;

function getGradeLetter(score) {
  if(score>=90) return 'A';
  if(score>=80) return 'B';
  if(score>=70) return 'C';
  if(score>=60) return 'D';
  return 'F';
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  const btns = document.querySelectorAll('.nav-item');
  const pages = ['dashboard','students','courses','grades','reports'];
  btns[pages.indexOf(page)].classList.add('active');
  if(page==='dashboard') renderDashboard();
  if(page==='students')  renderStudents();
  if(page==='courses')   renderCourses();
  if(page==='grades')    populateGradeSelect();
}

function renderDashboard() {
  const avgGPA = students.reduce((s,st)=>s+st.gpa,0)/students.length;
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card"><p class="s-label">Total Students</p><p class="s-val">${students.length}</p><p class="s-sub">Enrolled</p></div>
    <div class="stat-card"><p class="s-label">Total Courses</p><p class="s-val">${courses.length}</p><p class="s-sub">Active</p></div>
    <div class="stat-card"><p class="s-label">Avg GPA</p><p class="s-val">${avgGPA.toFixed(2)}</p><p class="s-sub">All students</p></div>
    <div class="stat-card"><p class="s-label">At Risk</p><p class="s-val">${students.filter(s=>s.gpa<2.0).length}</p><p class="s-sub">GPA below 2.0</p></div>
  `;
  renderDashCharts();
}

function renderDashCharts() {
  const courseCounts = {};
  courses.forEach(c=>courseCounts[c.code]=students.filter(s=>s.course===c.code).length);
  if(enrollChart) enrollChart.destroy();
  enrollChart = new Chart(document.getElementById('enroll-chart'),{
    type:'bar', data:{ labels:Object.keys(courseCounts), datasets:[{ data:Object.values(courseCounts), backgroundColor:'#3f51b5', borderRadius:6 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, ticks:{stepSize:1}} } }
  });

  const gradeCounts = {A:0,B:0,C:0,D:0,F:0};
  grades.forEach(g=>gradeCounts[getGradeLetter(g.score)]++);
  if(gradeChart) gradeChart.destroy();
  gradeChart = new Chart(document.getElementById('grade-chart'),{
    type:'doughnut', data:{ labels:Object.keys(gradeCounts), datasets:[{ data:Object.values(gradeCounts), backgroundColor:['#4ade80','#3b82f6','#fbbf24','#f97316','#f87171'], borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{font:{size:11}}}} }
  });
}

function renderStudents() {
  const q = document.getElementById('student-search').value.toLowerCase();
  const f = document.getElementById('student-filter').value;

  // populate filter
  const sel = document.getElementById('student-filter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">All courses</option>' + courses.map(c=>`<option value="${c.code}" ${cur===c.code?'selected':''}>${c.code}</option>`).join('');

  const filtered = students.filter(s=>
    (!q || s.name.toLowerCase().includes(q) || s.id.includes(q) || s.email.includes(q)) &&
    (!f || s.course===f)
  );

  document.getElementById('student-body').innerHTML = filtered.map(s=>`
    <tr>
      <td style="font-family:monospace;color:#64748b">${s.id}</td>
      <td><strong>${s.name}</strong></td>
      <td style="color:#64748b">${s.email}</td>
      <td>${s.course}</td>
      <td style="font-weight:600;color:${s.gpa>=3.5?'#16a34a':s.gpa<2.0?'#dc2626':'#334155'}">${s.gpa.toFixed(2)}</td>
      <td><span class="badge badge-${s.status}">${s.status}</span></td>
      <td>
        <button class="edit-btn" onclick="editStudent('${s.id}')">Edit</button>
        <button class="del-btn" onclick="deleteStudent('${s.id}')">✕</button>
      </td>
    </tr>
  `).join('');
}

function renderCourses() {
  document.getElementById('courses-grid').innerHTML = courses.map(c=>`
    <div class="course-card">
      <div class="course-card-header">
        <span class="course-code">${c.code}</span>
        <button class="del-btn" onclick="deleteCourse('${c.code}')">✕</button>
      </div>
      <h3>${c.name}</h3>
      <p>${c.dept}</p>
      <div class="course-meta">
        <span>📚 ${c.credits} credits</span>
        <span>👥 ${students.filter(s=>s.course===c.code).length} students</span>
      </div>
    </div>
  `).join('');
}

function populateGradeSelect() {
  document.getElementById('grade-student').innerHTML =
    '<option value="">Select student...</option>' +
    students.map(s=>`<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
}

function renderGrades() {
  const sid = document.getElementById('grade-student').value;
  if(!sid) { document.getElementById('grade-body').innerHTML = ''; return; }
  const sg = grades.filter(g=>g.studentId===sid);
  document.getElementById('grade-body').innerHTML = sg.length
    ? sg.map(g=>`<tr><td>${g.course}</td><td>${g.assignment}</td>
        <td style="font-weight:600">${g.score}</td>
        <td><span class="badge" style="background:${g.score>=90?'#dcfce7':g.score>=80?'#dbeafe':g.score>=70?'#fef9c3':'#fee2e2'};color:${g.score>=90?'#166534':g.score>=80?'#1e40af':g.score>=70?'#854d0e':'#991b1b'}">${getGradeLetter(g.score)}</span></td>
        <td style="color:#94a3b8">${g.date}</td></tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">No grades recorded.</td></tr>';
}

function openStudentModal(id) {
  const s = id ? students.find(st=>st.id===id) : null;
  document.getElementById('modal-title').textContent = s ? 'Edit Student' : 'Add Student';
  document.getElementById('modal-body').innerHTML = `
    <div><label>Full Name</label><input type="text" id="m-name" value="${s?s.name:''}" placeholder="Full name" /></div>
    <div><label>Email</label><input type="email" id="m-email" value="${s?s.email:''}" placeholder="Email address" /></div>
    <div><label>Course</label><select id="m-course">${courses.map(c=>`<option value="${c.code}" ${s&&s.course===c.code?'selected':''}>${c.code} — ${c.name}</option>`).join('')}</select></div>
    <div><label>GPA</label><input type="number" id="m-gpa" value="${s?s.gpa:''}" min="0" max="4" step="0.1" placeholder="0.0 – 4.0" /></div>
    <div><label>Status</label><select id="m-status">
      <option value="active" ${s&&s.status==='active'?'selected':''}>Active</option>
      <option value="inactive" ${s&&s.status==='inactive'?'selected':''}>Inactive</option>
      <option value="probation" ${s&&s.status==='probation'?'selected':''}>Probation</option>
    </select></div>
    <button class="modal-submit" onclick="saveStudent('${id||''}')">Save Student</button>
  `;
  document.getElementById('modal-overlay').classList.add('open');
}

function editStudent(id) { openStudentModal(id); }

function saveStudent(id) {
  const name   = document.getElementById('m-name').value.trim();
  const email  = document.getElementById('m-email').value.trim();
  const course = document.getElementById('m-course').value;
  const gpa    = parseFloat(document.getElementById('m-gpa').value);
  const status = document.getElementById('m-status').value;
  if(!name || !email || isNaN(gpa)) return alert('Fill all fields.');
  if(id) {
    const s = students.find(s=>s.id===id);
    Object.assign(s,{name,email,course,gpa,status});
  } else {
    students.push({ id:'S'+String(nextStudentId++).padStart(3, '0'), name, email, course, gpa, status });
  }
  closeModal();
  renderStudents();
}

function deleteStudent(id) {
  if(confirm('Delete this student?')) { students=students.filter(s=>s.id!==id); renderStudents(); }
}

function openCourseModal() {
  document.getElementById('modal-title').textContent = 'Add Course';
  document.getElementById('modal-body').innerHTML = `
    <div><label>Course Code</label><input type="text" id="m-code" placeholder="e.g. CS501" /></div>
    <div><label>Course Name</label><input type="text" id="m-cname" placeholder="Course name" /></div>
    <div><label>Department</label><input type="text" id="m-dept" placeholder="Department" /></div>
    <div><label>Credits</label><input type="number" id="m-credits" value="3" min="1" max="6" /></div>
    <button class="modal-submit" onclick="saveCourse()">Save Course</button>
  `;
  document.getElementById('modal-overlay').classList.add('open');
}

function saveCourse() {
  const code    = document.getElementById('m-code').value.trim().toUpperCase();
  const name    = document.getElementById('m-cname').value.trim();
  const dept    = document.getElementById('m-dept').value.trim();
  const credits = parseInt(document.getElementById('m-credits').value);
  if(!code||!name||!dept) return alert('Fill all fields.');
  courses.push({code,name,dept,credits,enrolled:0});
  closeModal();
  renderCourses();
}

function deleteCourse(code) {
  if(confirm('Delete course '+code+'?')) { courses=courses.filter(c=>c.code!==code); renderCourses(); }
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

async function generateReport(type) {
  const out = document.getElementById('report-output');
  const title = document.getElementById('report-title');
  const content = document.getElementById('report-content');
  out.style.display='block';

  if(type==='top') {
    title.textContent='Top Performing Students';
    const top = students.filter(s=>s.gpa>=3.5).sort((a,b)=>b.gpa-a.gpa);
    content.innerHTML = `<table><thead><tr><th>Name</th><th>Course</th><th>GPA</th><th>Status</th></tr></thead><tbody>
      ${top.map(s=>`<tr><td>${s.name}</td><td>${s.course}</td><td style="color:#16a34a;font-weight:700">${s.gpa}</td><td><span class="badge badge-active">active</span></td></tr>`).join('')}
    </tbody></table>`;
  } else if(type==='failing') {
    title.textContent='At-Risk Students';
    const at = students.filter(s=>s.gpa<2.0);
    content.innerHTML = `<table><thead><tr><th>Name</th><th>Course</th><th>GPA</th><th>Status</th></tr></thead><tbody>
      ${at.map(s=>`<tr><td>${s.name}</td><td>${s.course}</td><td style="color:#dc2626;font-weight:700">${s.gpa}</td><td><span class="badge badge-probation">${s.status}</span></td></tr>`).join('')}
    </tbody></table>`;
  } else if(type==='enrollment') {
    title.textContent='Enrollment by Course';
    content.innerHTML = `<table><thead><tr><th>Code</th><th>Course</th><th>Students</th><th>Credits</th></tr></thead><tbody>
      ${courses.map(c=>`<tr><td>${c.code}</td><td>${c.name}</td><td>${students.filter(s=>s.course===c.code).length}</td><td>${c.credits}</td></tr>`).join('')}
    </tbody></table>`;
  } else {
    title.textContent='AI Academic Report';
    content.innerHTML = '<p style="color:#64748b">Generating AI report...</p>';
    const summary = students.map(s=>`${s.name}: GPA ${s.gpa}, ${s.course}, ${s.status}`).join('\n');
    try {
      const apiKey = prompt('Enter your Anthropic API key:');
      if(!apiKey) { content.innerHTML = '<p style="color:#ef4444">API key required for report generation.</p>'; return; }
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST', headers:{'Content-Type':'application/json','x-api-key':apiKey},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000,
          messages:[{role:'user',content:`You are an academic advisor. Generate a full academic report for this institution.\n\nStudents:\n${summary}\n\nInclude: overall performance summary, at-risk students analysis, course performance breakdown, and 3 actionable recommendations.`}]
        })
      });
      const data = await res.json();
      content.innerHTML = `<div style="font-size:14px;line-height:1.8;color:#475569;white-space:pre-wrap">${data.content[0].text}</div>`;
    } catch(e) { content.innerHTML = '<p style="color:#ef4444">Report generation failed.</p>'; }
  }
}

async function getInsights() {
  const out = document.getElementById('ai-output');
  out.textContent = 'Generating insights...';
  const summary = `${students.length} students, avg GPA ${(students.reduce((s,st)=>s+st.gpa,0)/students.length).toFixed(2)}, ${students.filter(s=>s.gpa<2.0).length} at risk, ${students.filter(s=>s.gpa>=3.5).length} top performers.`;
  try {
    const apiKey = prompt('Enter your Anthropic API key:');
    if(!apiKey) { out.textContent = 'API key required.'; return; }
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST', headers:{'Content-Type':'application/json','x-api-key':apiKey},
      body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600,
        messages:[{role:'user',content:`Academic data: ${summary}\nGive 3 short insights and 2 action points for the institution.`}]
      })
    });
    const data = await res.json();
    out.textContent = data.content[0].text;
  } catch(e) { out.textContent='Failed to load insights.'; }
}

renderDashboard();