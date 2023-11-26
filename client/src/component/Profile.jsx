import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [login, setLogin] = useState(false);
  const [sites, setSites] = useState([]);
  const history = useHistory();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user information using the new /user endpoint
        const userResponse = await axios.get('https://dvisual-deployment-server.vercel.app/user');
        if (userResponse.data.success) {
          setLogin(true);
          setEmail(userResponse.data.user.email);

          // Fetch organization name
          const organizationResponse = await axios.get(
            `https://dvisual-deployment-server.vercel.app/organization/${userResponse.data.user.id}`
          );
          setOrganizationName(organizationResponse.data.organizationname);

          // Fetch the list of sites for the logged-in user's organization
          const sitesResponse = await axios.get(
            `https://dvisual-deployment-server.vercel.app/sites/${userResponse.data.user.organisation_id}`
          );
          setSites(sitesResponse.data.sites);
        } else {
          // Redirect to login if the user is not authenticated
          history.push('/login');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Internal Server Error');
      }
    };

    fetchData();
  }, [history]);

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
        <div className="sitedabba container-xxl">
          {sites.map((site) => (
            <div class="added-button" key={site.site_id} onClick={() => handleSiteButtonClick(site.site_id)}>
              {site.site_name} - {site.site_location}
            </div>
          ))}
        </div>
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
