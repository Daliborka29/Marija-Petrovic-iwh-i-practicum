require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'pug');

// HubSpot API configuration
const hubspotApiKey = process.env.HUBSPOT_API_KEY;
const hubspotApiUrl = 'https://api.hubapi.com';

// Your custom object ID - replace with your actual custom object ID
const customObjectId = process.env.CUSTOM_OBJECT_ID;

// Homepage route
app.get('/', async (req, res) => {
  try {
    // Fetch all music events from HubSpot
    const response = await axios.get(
      `${hubspotApiUrl}/crm/v3/objects/${customObjectId}`,
      {
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          properties: ['name', 'venue', 'date', 'genre']
        }
      }
    );

    const musicEvents = response.data.results;
    
    // Render the homepage with music events data
    res.render('homepage', {
      title: 'Music Events | Integrating With HubSpot I Practicum',
      musicEvents: musicEvents
    });
  } catch (error) {
    console.error('Error fetching music events:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).render('error', { 
      title: 'Error | Integrating With HubSpot I Practicum',
      message: 'Failed to fetch music events' 
    });
  }
});

// Form page route
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
  });
});

// Create new music event route
app.post('/update-cobj', async (req, res) => {
  try {
    const { name, venue, date, genre } = req.body;

    // Create music event in HubSpot
    await axios.post(
      `${hubspotApiUrl}/crm/v3/objects/${customObjectId}`,
      {
        properties: {
          name,
          venue,
          date,
          genre
        }
      },
      {
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Redirect to homepage
    res.redirect('/');
  } catch (error) {
    console.error('Error creating music event:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).render('error', { 
      title: 'Error | Integrating With HubSpot I Practicum',
      message: 'Failed to create music event' 
    });
  }
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Error | Integrating With HubSpot I Practicum',
    message: 'Page not found' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});