document.addEventListener('DOMContentLoaded', async () => {
  const eid = localStorage.getItem('eid'); // Assume you store eid after login

  if (!eid) {
    alert('Not logged in');
    window.location.href = 'employee.html'; // Redirect to login page
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/employees/${eid}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch employee details: ${res.statusText}`);
    }

    const emp = await res.json();

    // Display employee details
    const empDiv = document.getElementById('employee-details');
    empDiv.innerHTML = `
      <p><strong>ID:</strong> ${emp.eid}</p>
      <p><strong>Name:</strong> ${emp.ename}</p>
      <p><strong>Phone:</strong> ${emp.ephone}</p>
      <p><strong>Department:</strong> ${emp.edept}</p>
      <p><strong>Manager:</strong> ${emp.mname}</p>
      <p><strong>Manager ID:</strong> ${emp.mid}</p>
    `;

    // ✅ Correctly store mid and mname from employee data
    localStorage.setItem('mid', emp.mid);
    localStorage.setItem('mname', emp.mname);

    // ✅ Ensure the form and inputs exist
    const form = document.getElementById('leave-form');
    const leavetype = document.getElementById('leavetype');
    const leavereason = document.getElementById('leavereason');
    const start_date = document.getElementById('start_date');
    const end_date = document.getElementById('end_date');

    if (!form || !leavetype || !leavereason || !start_date || !end_date) {
      console.error('One or more form elements are missing');
      return;
    }

    // Form submission handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const leavetypeValue = leavetype.value.trim();
      const leavereasonValue = leavereason.value.trim();
      const start_dateValue = start_date.value;
      const end_dateValue = end_date.value;
      const mid = localStorage.getItem('mid');
      const mname = localStorage.getItem('mname');

      if (!leavetypeValue || !leavereasonValue || !start_dateValue || !end_dateValue) {
        alert('All fields are required');
        return;
      }

      const payload = {
        eid: emp.eid,
        ename: emp.ename,
        leavetype: leavetypeValue,
        leavereason: leavereasonValue,
        start_date: start_dateValue,
        end_date: end_dateValue,
        mid,
        mname
      };

      console.log('Submitting payload:', payload); // Debug info

      try {
        const response = await fetch('http://localhost:3000/api/apply-leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          alert('Leave applied successfully');
          form.reset(); // Clear form
        } else {
          alert('Failed to apply leave: ' + data.message);
        }
      } catch (err) {
        console.error('Error applying leave:', err);
        alert('Error while applying for leave');
      }
    });

  } catch (err) {
    console.error('Error fetching employee:', err);
    alert('Could not load employee info');
  }
});
