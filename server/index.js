const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const saltRounds = 10;

const PORT = process.env.PORT || 8000;
const BaseURL = process.env.URL || '';
const app = express();

// Use the default in-memory session store
app.use(
  session({
    secret: 'abdullah',
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if your site is served over HTTPS
      maxAge: 60000, // Set the session duration in milliseconds
    },
  })
);

app.use(
  cors({
    origin: 'https://dvisual-five.vercel.app',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Your existing MySQL connection setup
const db = mysql.createConnection({
  host: 'database-1.caoacq3ev5m0.eu-north-1.rds.amazonaws.com',
  user: 'abdullah',
  password: 'abdullah-w-21',
  database: 'dvisual',
});

app.get('/', (req, res) => {
  res.send('hi');
});

app.post('/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const organisationname = req.body.organisationname;

  const organisation_id = uuidv4();
  const role_id = uuidv4();
  const status = true;
  const currentDate = new Date();
  const futureDate = new Date();
  futureDate.setDate(currentDate.getDate() + 30);
  const randomDate = new Date(
    currentDate.getTime() + Math.random() * (futureDate.getTime() - currentDate.getTime())
  );

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    const data = {
      email: email,
      password: hash,
      organisationname: organisationname,
      organisation_id: organisation_id,
      status: status,
      activedate: randomDate,
    };

    const userExists = await db.query('SELECT * FROM users WHERE email=?', [email]);

    if (userExists.length > 0) {
      return res.send({ msg: 'User Email Already Present' });
    }

    await db.beginTransaction();

    const organizationSql = 'INSERT INTO organizations (organisation_id, organisationname) VALUES (?, ?)';
    const organizationValues = [organisation_id, organisationname];

    await db.query(organizationSql, organizationValues);

    const result = await db.query('INSERT INTO users SET ?', data);

    const user_id = result.insertId;

    const roleData = {
      role_id: role_id,
      user_id: user_id,
      role: 'user',
    };

    await db.query('INSERT INTO user_roles SET ?', roleData);

    await db.commit();

    return res.send({ msg: 'User registered successfully' });
  } catch (error) {
    await db.rollback();
    console.error('Error during registration:', error);
    return res.status(500).send({ msg: 'Error while registering user' });
  }
});

app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (req.session.user) {
    return res.send({ login: true, useremail: email });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email=?', [email]);

    if (result.length > 0) {
      const passwordMatch = await bcrypt.compare(password, result[0].password);

      if (passwordMatch) {
        req.session.user = result[0];
        return res.send({ login: true, useremail: email });
      } else {
        return res.send({ login: false, msg: 'Wrong Password' });
      }
    } else {
      return res.send({ login: false, msg: 'User Email Not Exists' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send({ msg: 'Error while retrieving user information' });
  }
});

app.get('/login', (req, res) => {
  try {
    if (req.session && req.session.user) {
      return res.send({ login: true, user: req.session.user });
    } else {
      return res.send({ login: false });
    }
  } catch (error) {
    console.error('Error in /login:', error);
    return res.status(500).send({ login: false, error: 'Internal Server Error' });
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

  const sql =
    'SELECT o.organisationname FROM users u JOIN organizations o ON u.organisation_id = o.organisation_id WHERE u.id = ?';

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

app.post('/add-site', async (req, res) => {
  const siteName = req.body.site_name;
  const siteLocation = req.body.site_location;

  try {
    const userId = req.session.user.id;
    const organizationId = req.session.user.organisation_id;
    const siteId = uuidv4();

    await db.query('INSERT INTO sites (site_id, organisation_id, site_name, site_location) VALUES (?, ?, ?, ?)', [
      siteId,
      organizationId,
      siteName,
      siteLocation,
    ]);

    res.status(200).json({ success: true, siteId });
  } catch (error) {
    console.error('Error adding site:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/sites/:organizationId', (req, res) => {
  const organizationId = req.params.organizationId;

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

  const getSensorNamesSql = 'SELECT sensorname FROM master WHERE site_id = ?';

  db.query(getSensorNamesSql, [siteId], (err, result) => {
    if (err) {
      console.error('Error fetching sensor names:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const sensorNames = result.map((row) => row.sensorname);
    return res.status(200).json({ sensorNames });
  });
});

app.get('/sensor-data/:sensorName/:siteId', (req, res) => {
  const sensorName = req.params.sensorName;
  const siteId = req.params.siteId;

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

    const getSensorDataSql = 'SELECT date, time, reading FROM transactions WHERE sensor_id = ?';

    db.query(getSensorDataSql, [sensorId], (err, result) => {
      if (err) {
        console.error('Error fetching sensor data:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

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
