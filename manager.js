document.getElementById("container").addEventListener("submit", function (e) {
  e.preventDefault();

  const mid = document.getElementById("mid").value.trim();
  const mname = document.getElementById("mname").value.trim();
  const mpassword = document.getElementById("mpassword").value.trim();

  if (!mid || !mname || !mpassword) {
    alert("Please fill in all fields");
    return;
  }

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mid, mname, mpassword })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        // Save session data
        localStorage.setItem("mid", data.user.mid);
        localStorage.setItem("mname", data.user.mname);
        // Redirect
        window.location.href = "managerdashboard.html";
      } else {
        alert("Login failed");
      }
    })
    .catch(() => {
      alert("Login failed. Please try again.");
    });
});
