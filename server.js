  const express = require('express');
  const mysql = require('mysql2');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const path = require('path');

  const app = express();


  app.use(cors());
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // MySQL connection
  const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  });

  connection.connect(err => {
    if (err) throw err;
    console.log('✅ Connected to MySQL');
  });


  // Login API
  app.post('/login', (req, res) => {
    const { mid, mname, mpassword } = req.body;

    if (!mid || !mname || !mpassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    connection.query(
      'SELECT * FROM MANAGER WHERE MID = ? AND MNAME = ? AND MPASSWORD = ?',
      [mid, mname, mpassword],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
          res.json({ message: 'Login Successful', user: result[0] });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      }
    );
  });


  // Employee CRUD APIs
  // Get all employees
  app.get('/api/employees', (req, res) => {
    connection.query('SELECT * FROM employee', (err, results) => {
      if (err) {
        console.error('Error fetching employees:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });

 // Add new employee
app.post('/api/employees', (req, res) => {
  const { eid, ename, edept, ephone, epassword, mid, mname } = req.body;

  if (!eid || !ename || !edept || !ephone || !epassword || !mid || !mname) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  connection.query(
    'INSERT INTO employee (eid, ename, edept, ephone, epassword, mid, mname) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [eid, ename, edept, ephone, epassword, mid, mname],
    (err, result) => {
      if (err) {
        console.error('Error adding employee:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Employee added successfully', id: eid });
    }
  );
});


  // Update employee
  app.put('/api/employees/:id', (req, res) => {
    const { ename, edept, ephone, epassword } = req.body;
    const eid = req.params.id;
    
    if (!ename || !edept || !ephone || !epassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    connection.query(
      'UPDATE employee SET ename = ?, edept = ?, ephone = ?, epassword = ? WHERE eid = ?',
      [ename, edept, ephone, epassword, eid],
      (err, result) => {
        if (err) {
          console.error('Error updating employee:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully' });
      }
    );
  });

  // Delete employee
  app.delete('/api/employees/:id', (req, res) => {
    const eid = req.params.id;
    
    connection.query(
      'DELETE FROM employee WHERE eid = ?',
      [eid],
      (err, result) => {
        if (err) {
          console.error('Error deleting employee:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
      }
    );
  });


  app.post('/api/elogin', (req, res) => {
  const { eid, epassword } = req.body;

  if (!eid || !epassword) {
    return res.status(400).json({ message: 'Employee ID and password are required' });
  }

  const sql = 'SELECT * FROM employee WHERE eid = ? AND epassword = ?';
  connection.query(sql, [eid, epassword], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Login successful
    res.json({ message: 'Login successful', employee: results[0] });
  });
});

app.get('/api/employees/:eid', (req, res) => {
  const eid = req.params.eid;
  
  const query = 'SELECT * FROM employee WHERE eid = ?';
  
  connection.execute(query, [eid], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error fetching employee details', error: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = results[0]; // Assuming the query returns an array of results, get the first one.
    
    res.json({
      eid: employee.eid,
      ename: employee.ename,
      ephone: employee.ephone,
      edept: employee.edept,
      mid: employee.mid,
      mname: employee.mname
    });
  });
});


// Apply for leave
app.post('/api/apply-leave', (req, res) => {
  const { eid, ename, leavetype, leavereason , start_date, end_date, mid, mname } = req.body;

  // Validate input data
  if (!eid || !ename || !leavetype || !leavereason  || !start_date || !end_date || !mid || !mname) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = `
  INSERT INTO leaves (eid, ename, leavereason, leavetype, start_date, end_date, mid, mname)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

  connection.execute(query, [eid, ename, leavereason, leavetype, start_date, end_date, mid, mname], (err, result) => {
    if (err) {
      console.error('Database error:', err); // Log database error
      return res.status(500).json({ message: 'Error applying for leave', error: err });
    }

    res.status(200).json({ message: 'Leave applied successfully' });
  });
});


app.get('/api/leaves/pending/:mid', (req, res) => {
  const mid = req.params.mid;
  const query = `SELECT * FROM leaves WHERE leavestatus = 'pending' AND mid = ?`;

  connection.query(query, [mid], (err, results) => {
    if (err) {
      console.error('Error fetching pending leaves:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});


app.get('/api/leaves', (req, res) => {
  const query = 'SELECT * FROM leaves WHERE leavestatus = "Pending"';
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch leaves' });
    res.json(results);
  });
});



app.put('/api/leaves/update', (req, res) => {
  const { eid, leavestatus } = req.body;

  console.log("🔍 Incoming Update:", { eid, leavestatus });

  if (!eid || !leavestatus) {
    return res.status(400).json({ error: 'Missing eid or leavestatus' });
  }

  const query = `
    UPDATE leaves
    SET leavestatus = ?
    WHERE eid = ?
    LIMIT 1
  `;

  connection.query(query, [leavestatus, eid], (err, result) => {
    if (err) {
      console.error('❌ MySQL Error:', err);
      return res.status(500).json({ error: 'Failed to update leave status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ message: `Leave successfully ${leavestatus.toLowerCase()}` });
  });
});












  const port = process.env.port;
  app.listen(port, () => {
    console.log('Server running at http://localhost:3000');
  });
