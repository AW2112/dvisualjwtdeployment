import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';


const Profile = () => {
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [login, setLogin] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [error, setError] = useState('');
  const [showAddSiteForm, setShowAddSiteForm] = useState(false);
  const [sites, setSites] = useState([]);
  const history = useHistory();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loginResponse = await axios.get('https://dvisual-deployment.vercel.app/login');
        setLogin(loginResponse.data.login);

        if (loginResponse.data.user) {
          setEmail(loginResponse.data.user[0].email);

          // Fetch organization name
          const organizationResponse = await axios.get(`https://dvisual-deployment.vercel.app/organization/${loginResponse.data.user[0].id}`);
          setOrganizationName(organizationResponse.data.organizationname);

          // Fetch the list of sites for the logged-in user's organization
          const sitesResponse = await axios.get(`https://dvisual-deployment.vercel.app/sites/${loginResponse.data.user[0].organisation_id}`);
          setSites(sitesResponse.data.sites);
        } else {
          history.push('/login');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [history]);

  const handleAddSite = async () => {
    try {
      // Fetch the logged-in user's data
      const loginResponse = await axios.get('https://dvisual-deployment.vercel.app/login');
      if (!loginResponse.data.user) {
        history.push('/login');
        return;
      }

      const response = await axios.post('https://dvisual-deployment.vercel.app/add-site', {
        organisation_id: loginResponse.data.user[0].organisation_id,
        site_name: siteName,
        site_location: siteLocation,
      }, { withCredentials: true });

      if (response.data.success) {
        setShowAddSiteForm(false);
        setSiteName('');
        setSiteLocation('');
        setError('');
        // Fetch the updated list of sites and update the state accordingly
        const updatedSitesResponse = await axios.get(`https://dvisual-deployment.vercel.app/sites/${loginResponse.data.user[0].organisation_id}`);
        setSites(updatedSitesResponse.data.sites);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error adding site:', error);
      setError('Internal Server Error');
    }
  };

  const handleSiteButtonClick = (siteId) => {
    history.push(`/visualize/${siteId}`);
  };

  return (
    <>
      
      <section
        style={{
          backgroundColor: '#1a1a1a',
          color: 'white',
          width: '100%',
          height: '90vh',
        }}
      >
        {/* <div className="box">
          <p>Email: {login ? email : null}</p>
          <p>Organization Name: {organizationName}</p>
        </div> */}

        <div className="sitedabba container-xxl">
          {sites.map((site) => (
            <div class="added-button" key={site.site_id} onClick={() => handleSiteButtonClick(site.site_id)}>
              {site.site_name} - {site.site_location}
            </div>
          ))}
          {/* {showAddSiteForm ? (
            <>
              <div>
                <label>Site Name:</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div>
                <label>Site Location:</label>
                <input
                  type="text"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                />
              </div>
              <button onClick={handleAddSite}>Add Site</button>
              <button onClick={() => setShowAddSiteForm(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setShowAddSiteForm(true)}>Add Site</button>
          )} */}
        </div>
        {showAddSiteForm ? (
            <>
            <div class="afterbutton">
            <div>
                <label class="sitename-label">Site Name:</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div>
                <label class="sitelocation-label">Site Location:</label>
                <input
                  type="text"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                />
                <button  onClick={handleAddSite}>Add Site</button>
                <button onClick={() => setShowAddSiteForm(false)}>Cancel</button>
              </div>

            </div>
           
            </>
          ) : (
            <button class="mysitebutton" onClick={() => setShowAddSiteForm(true)}>Add Site</button>
          )}
           <div className="box">
          <p>Email: {login ? email : null}</p>
          <p>Organization Name: {organizationName}</p>
        </div> 

      </section>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  );
};

export default Profile;
