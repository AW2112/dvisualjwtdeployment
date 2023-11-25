import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';



const Visualize = ({ siteId }) => {
  const [sensorNames, setSensorNames] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSensorNames = async () => {
      try {
        const response = await axios.get(`https://dvisual-deployment.vercel.app/sensors/${siteId}`);
        setSensorNames(response.data.sensorNames);
      } catch (error) {
        console.error('Error fetching sensor names:', error);
        setError('Error fetching sensor names');
      }
    };

    fetchSensorNames();
  }, [siteId]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        if (selectedSensor) {
          setLoading(true);
          const response = await axios.get(
            `https://dvisual-deployment.vercel.app/sensor-data/${selectedSensor}/${siteId}`
          );
          setSensorData(response.data.sensorData);
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        setError('Error fetching sensor data');
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, [selectedSensor, siteId]);

  // Function to group data by date for PieChart
  const groupDataByDate = () => {
    const groupedData = sensorData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += entry.reading;
      return acc;
    }, {});
    return Object.entries(groupedData).map(([date, reading]) => ({ date, reading }));
  };

  // Function to format time for BarChart
  const formatTime = (time) => {
    const [hours, minutes, seconds] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div style={{ backgroundColor: '#333', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>Visualize Page</h1>
      <label style={{ marginRight: '10px' }}>Select Sensor:</label>
      <select
        value={selectedSensor}
        onChange={(e) => setSelectedSensor(e.target.value)}
        style={{ padding: '5px' }}
      >
        <option value="">Select Sensor</option>
        {sensorNames.map((sensorName, index) => (
          <option key={index} value={sensorName}>
            {sensorName}
          </option>
        ))}
      </select>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Visualization for {selectedSensor}</p>
      {selectedSensor && (
        <div style={{ marginTop: '20px' }}>
          {/* Line Chart */}
          <h2>Line Chart</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sensorData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reading" stroke="#8884d8" name="Reading" />
            </LineChart>
          </ResponsiveContainer>

          {/* Bar Chart */}
          <h2>Bar Chart</h2>
          <ResponsiveContainer width="100%" height={400} style={{ marginTop: '20px' }}>
            <BarChart data={sensorData}>
              <XAxis dataKey="time" tickFormatter={formatTime} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reading" fill="#8884d8" name="Reading" />
            </BarChart>
          </ResponsiveContainer>

          {/* Pie Chart */}
          <h2>Pie Chart</h2>
          <ResponsiveContainer width="100%" height={400} style={{ marginTop: '20px' }}>
            <PieChart>
              <Pie
                data={groupDataByDate()}
                dataKey="reading"
                nameKey="date"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {groupDataByDate().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Visualize;
