document.addEventListener("DOMContentLoaded", () => {
  fetch('http://localhost:3000/api/leaves')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('leave-requests');
      container.innerHTML = data.map(leave => `
  <div class="leave-card">
    <p><strong>Employee ID:</strong> ${leave.eid}</p>
    <p><strong>Name:</strong> ${leave.ename}</p>
    <p><strong>Reason:</strong> ${leave.leavereason}</p>
    <p><strong>Type:</strong> ${leave.leavetype}</p>
    <p><strong>Start:</strong> ${leave.start_date}</p>
    <p><strong>End:</strong> ${leave.end_date}</p>
    <p><strong>Applied:</strong> ${leave.applied_date}</p>
    <button onclick="updateLeaveStatus('${leave.eid}', 'Approved')">✅ Approve</button>
    <button onclick="updateLeaveStatus('${leave.eid}', 'Denied')">❌ Deny</button>
  </div>
`).join('');

    });
});

function updateLeaveStatus(eid, status) {
  console.log("📤 Sending update for EID:", eid, "Status:", status);

  fetch(`http://localhost:3000/api/leaves/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ eid, leavestatus: status })
  })
    .then(res => res.json())
    .then(response => {
      alert(response.message);
      location.reload();
    })
    .catch(err => console.error('❌ Request failed:', err));
}

