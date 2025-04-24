export default async (req, res) => {
  try {
    const apiKey = process.env.API_KEY; // Accessible server-side
    const { city } = req.query; // Get city from query parameter
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error('Weather API request failed');
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
