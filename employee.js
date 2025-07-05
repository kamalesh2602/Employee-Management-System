document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('container');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const eid = document.getElementById('eid').value.trim();
    const epassword = document.getElementById('epassword').value.trim();

    if (!eid || !epassword) {
      alert('Please enter both Employee ID and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/elogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eid, epassword }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('eid',data.employee.eid);
        localStorage.setItem('ename',data.employee.ename);
        alert('Login successful! Welcome, ' + data.employee.ename);
        // Redirect or store session if needed
        window.location.href = "employeeleave.html";
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});
