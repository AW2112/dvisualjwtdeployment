const express = require('express');
const mysql = require('mysql');
const cors = require("cors");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const session = require("express-session");
const saltRounds = 10;
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8000;
const BaseURL = process.env.URL || '';
const app = express();

app.use(cors({
    origin: 'https://dvisual-deployment-5ask.vercel.app',
    credentials: true,
}));
app.use(express.json());
app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    key: "userId",
    secret: "abdullah",
    resave: true,
    saveUninitialized: true,
}))

const db = mysql.createConnection({
    host: 'database-1.caoacq3ev5m0.eu-north-1.rds.amazonaws.com',
    user: 'abdullah',
    password: 'abdullah-w-21',
    database: 'dvisual'
})

app.get("/", (req, res) => {
    res.send("hi");
})

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const organisationname = req.body.organisationname;

    // Generate unique ids using UUID
    const organisation_id = uuidv4();
    const role_id = uuidv4();

    // Set a default value of 'True' for status
    const status = true;

    // Generate a random activation date between now and 30 days in the future
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30);

    // Generate a random date within the specified range
    const randomDate = new Date(
        currentDate.getTime() + Math.random() * (futureDate.getTime() - currentDate.getTime())
    );

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
            return res.send({ msg: "Error while hashing password" });
        }

        const data = {
            email: email,
            password: hash,
            organisationname: organisationname,
            organisation_id: organisation_id,
            status: status,
            activedate: randomDate,
        };

        let sqll = `SELECT * FROM users WHERE email='${email}'`;
        db.query(sqll, (er, ress) => {
            if (ress.length > 0) {
                res.send({ msg: "User Email Already Present" });
            } else {
                // Insert into the organizations table
                let organizationSql = "INSERT INTO organizations (organisation_id, organisationname) VALUES (?, ?)";
                let organizationValues = [organisation_id, organisationname];

                db.query(organizationSql, organizationValues, (orgErr, orgResult) => {
                    if (orgErr) {
                        console.log(orgErr);
                        return res.send({ msg: "Error while adding organization" });
                    }

                    // Now that the organisation_id and organisationname are inserted, proceed to insert into the users table
                    let sql = "INSERT INTO users SET ?";
                    db.query(sql, data, (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.send({ msg: "Error while registering user" });
                        }

                        // Now that the user is registered, you can get the user_id
                        const user_id = result.insertId;

                        // Set the user_id and organisation_id for the roleData
                        const roleData = {
                            role_id: role_id,
                            user_id: user_id,
                            role: "user",
                        };

                        db.query("INSERT INTO user_roles SET ?", roleData, (roleErr, roleResult) => {
                            if (roleErr) {
                                console.log(roleErr);
                                return res.send({ msg: "Error while assigning role" });
                            }

                            return res.send({ msg: "User registered successfully" });
                        });
                    });
                });
            }
        });
    });
});




app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let sql = `SELECT * FROM users WHERE email='${email}'`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.send({ msg: "Error while retrieving user information" });
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (err, response) => {
                if (response) {
                    req.session.user = result;
                    return res.send({ login: true, useremail: email });
                } else {
                    return res.send({ login: false, msg: "Wrong Password" });
                }
            });
        } else {
            return res.send({ login: false, msg: "User Email Not Exists" });
        }
    });
});


app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.send({ login: true, user: req.session.user });
    } else {
        return res.send({ login: false });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
  
      res.clearCookie('connect.sid');
  
      res.status(200).json({ success: true, message: 'Logout successful' });
    });
  });

  app.get('/organization/:userId', (req, res) => {
    const userId = req.params.userId;
  
    // Query the database to get the organization name based on userId
    const sql = 'SELECT o.organisationname FROM users u JOIN organizations o ON u.organisation_id = o.organisation_id WHERE u.id = ?';
  
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error('Error fetching organization data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (result.length > 0) {
          const organizationname = result[0].organisationname;
          res.json({ organizationname });
        } else {
          res.status(404).json({ error: 'Organization not found' });
        }
      }
    });
  });


  app.post('/add-site', (req, res) => {
    const siteName = req.body.site_name;
    const siteLocation = req.body.site_location;
    //console.log(req.session.user[0]);
  //console.log(req.body);
    
    // Fetch the logged-in user's data
    const userId = req.session.user[0].id; // Assuming you store user ID in the session
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const organizationId =   req.session.user[0].organisation_id;
  
      
      const siteId = uuidv4();
  
      // Insert the new site into the sites table
      const insertSiteSql = "INSERT INTO sites (site_id, organisation_id, site_name, site_location) VALUES (?, ?, ?, ?)";
      db.query(insertSiteSql, [siteId, organizationId, siteName, siteLocation], (siteErr, siteResult) => {
        if (siteErr) {
          console.error('Error adding site:', siteErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        return res.status(200).json({ success: true, siteId });
      });
    });
  
  
 
app.get('/sites/:organizationId', (req, res) => {
  const organizationId = req.params.organizationId;

  // Replace this with your database query to fetch sites based on organization ID
  const getSitesSql = 'SELECT * FROM sites WHERE organisation_id = ?';
  db.query(getSitesSql, [organizationId], (err, result) => {
    if (err) {
      console.error('Error fetching sites:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    return res.status(200).json({ sites: result });
  });
});

app.get('/sensors/:siteId', (req, res) => {
  const siteId = req.params.siteId;
  //console.log('Requested siteId:', siteId);

  const getSensorNamesSql = 'SELECT sensorname FROM master WHERE site_id = ?';
  db.query(getSensorNamesSql, [siteId], (err, result) => {
    if (err) {
      console.error('Error fetching sensor names:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const sensorNames = result.map((row) => row.sensorname);
    //console.log('Retrieved sensor names:', sensorNames);

    return res.status(200).json({ sensorNames });
  });
});


app.get('/sensor-data/:sensorName/:siteId', (req, res) => {
  const sensorName = req.params.sensorName;
  const siteId = req.params.siteId;

  // Fetch sensor_id from the master table based on sensorname and site_id
  const getSensorIdSql = 'SELECT sensorid FROM master WHERE sensorname = ? AND site_id = ?';
  db.query(getSensorIdSql, [sensorName, siteId], (err, result) => {
    if (err) {
      console.error('Error fetching sensor_id:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const sensorId = result[0].sensorid;

    // Fetch data from the transactions table based on the obtained sensor_id
    const getSensorDataSql = 'SELECT date, time, reading FROM transactions WHERE sensor_id = ?';
    db.query(getSensorDataSql, [sensorId], (err, result) => {
      if (err) {
        console.error('Error fetching sensor data:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Transform the data if needed
      const sensorData = result.map((row) => ({
        date: row.date,
        time: row.time,
        reading: row.reading,
      }));

      return res.status(200).json({ sensorData });
    });
  });
});



app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
