export default async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY is not set');
    }
    const { city, lat, lon } = req.query;

    console.log('Received query:', { city, lat, lon });

    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'City or both lat and lon are required' });
    }

    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    } else {
      const latNum = Number(lat);
      const lonNum = Number(lon);
      if (isNaN(latNum) || isNaN(lonNum)) {
        return res.status(400).json({ error: `Invalid coordinates: lat=${lat}, lon=${lon}` });
      }
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&appid=${apiKey}&units=metric`;
    }

    console.log('Fetching URL:', url.replace(apiKey, 'REDACTED'));
    const response = await fetch(url);
    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Weather API failed: ${errorData.message || 'Unknown error'}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Serverless error:', error.message);
    res.status(500).json({ error: error.message });
  }
};