
const mid = localStorage.getItem('mid');
const mname = localStorage.getItem('mname');

console.log(`Logged in as ${mname} (ID: ${mid})`);

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const employeeList = document.getElementById('employee-list');
  const addPopup = document.getElementById('add-popup');
  const editPopup = document.getElementById('edit-popup');
  const deletePopup = document.getElementById('delete-popup');
  const popupOverlay = document.getElementById('main-popup-overlay');
  
  // Buttons
  const addPopupButton = document.getElementById('add-popup-button');
  const cancelAddPopup = document.getElementById('cancel-add-popup');
  const cancelEditPopup = document.getElementById('cancel-edit-popup');
  const cancelDeletePopup = document.getElementById('cancel-delete-popup');
  
  // Forms
  const addEmployeeForm = document.getElementById('add-employee-form');
  const editEmployeeForm = document.getElementById('edit-employee-form');
  
  // Variables
  let employees = [];
  let employeeToDelete = null;

  // Fetch all employees
  function fetchEmployees() {
    fetch('http://localhost:3000/api/employees')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        employees = data;
        renderEmployees();
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
        employeeList.innerHTML = '<p class="error">Error loading employees. Please try again.</p>';
      });
  }

  // Render employees in the table
  function renderEmployees() {
    employeeList.innerHTML = '';
    
    if (employees.length === 0) {
      employeeList.innerHTML = '<p>No employees found</p>';
      return;
    }
    
    const table = document.createElement('table');
    table.className = 'employee-table';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Department</th>
        <th>Phone</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    employees.forEach(employee => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${employee.eid}</td>
        <td>${employee.ename}</td>
        <td>${employee.edept}</td>
        <td>${employee.ephone}</td>
        <td class="actions">
          <button class="edit-btn" data-id="${employee.eid}">Edit</button>
          <button class="delete-btn" data-id="${employee.eid}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    employeeList.appendChild(table);
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEdit);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
  }

  // Handle edit button click
  function handleEdit(e) {
    const eid = e.target.getAttribute('data-id');
    const employee = employees.find(emp => emp.eid === eid);
    
    if (employee) {
      document.getElementById('edit-eid').value = employee.eid;
      document.getElementById('edit-ename').value = employee.ename;
      document.getElementById('edit-edept').value = employee.edept;
      document.getElementById('edit-ephone').value = employee.ephone;
      document.getElementById('edit-epassword').value = employee.epassword;
      
      showPopup(editPopup);
    }
  }

  // Handle delete button click
  function handleDelete(e) {
    const eid = e.target.getAttribute('data-id');
    employeeToDelete = eid;
    document.getElementById('delete-eid').value = eid;
    showPopup(deletePopup);
  }

  // Show popup
  function showPopup(popup) {
    popupOverlay.style.display = 'block';
    popup.style.display = 'block';
  }

  // Hide popup
  function hidePopup(popup) {
    popupOverlay.style.display = 'none';
    popup.style.display = 'none';
  }

  // Event listeners
  addPopupButton.addEventListener('click', () => showPopup(addPopup));
  cancelAddPopup.addEventListener('click', () => hidePopup(addPopup));
  cancelEditPopup.addEventListener('click', () => hidePopup(editPopup));
  cancelDeletePopup.addEventListener('click', () => hidePopup(deletePopup));
  
  popupOverlay.addEventListener('click', () => {
    hidePopup(addPopup);
    hidePopup(editPopup);
    hidePopup(deletePopup);
  });

  // Add employee form submission
  addEmployeeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newEmployee = {
      eid: document.getElementById('eid').value,
      ename: document.getElementById('ename').value,
      edept: document.getElementById('edept').value,
      ephone: document.getElementById('ephone').value,
      epassword: document.getElementById('epassword').value,
      mname,
      mid
    };
    
    fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEmployee),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add employee');
      }
      return response.json();
    })
    .then(data => {
      console.log('Employee added:', data);
      fetchEmployees();
      hidePopup(addPopup);
      addEmployeeForm.reset();
    })
    .catch(error => {
      console.error('Error adding employee:', error);
      alert('Error adding employee: ' + error.message);
    });
  });

  // Edit employee form submission
  editEmployeeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const updatedEmployee = {
      ename: document.getElementById('edit-ename').value,
      edept: document.getElementById('edit-edept').value,
      ephone: document.getElementById('edit-ephone').value,
      epassword: document.getElementById('edit-epassword').value
    };
    
    const eid = document.getElementById('edit-eid').value;
    
    fetch(`http://localhost:3000/api/employees/${eid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEmployee),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update employee');
      }
      return response.json();
    })
    .then(data => {
      console.log('Employee updated:', data);
      fetchEmployees();
      hidePopup(editPopup);
    })
    .catch(error => {
      console.error('Error updating employee:', error);
      alert('Error updating employee: ' + error.message);
    });
  });

  // Delete confirmation
  document.getElementById('confirm-delete').addEventListener('click', function() {
    const eid = employeeToDelete;
    
    fetch(`http://localhost:3000/api/employees/${eid}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      return response.json();
    })
    .then(data => {
      console.log('Employee deleted:', data);
      fetchEmployees();
      hidePopup(deletePopup);
      employeeToDelete = null;
    })
    .catch(error => {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee: ' + error.message);
    });
  });

  // Initial fetch
  fetchEmployees();
});