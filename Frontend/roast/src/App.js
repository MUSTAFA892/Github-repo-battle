import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the updated CSS file for styling
import image1 from '../src/static/profiles/image1.jpg';
import image2 from '../src/static/profiles/image2.jpg';
import animeSVG from './static/vecteezy_vector-manga-anime-pirate-japan-character-cute-cartoon_24104948.svg'; // Import your SVG image

const App = () => {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [profile1, setProfile1] = useState(null);
  const [profile2, setProfile2] = useState(null);
  const [response, setResponse] = useState('');
  const [battleStarted, setBattleStarted] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [displayedResponse, setDisplayedResponse] = useState(''); // For displaying typewriter effect

  // Function to fetch user profile from GitHub
  const fetchProfile = async (username) => {
    try {
      const res = await axios.get(`https://api.github.com/users/${username}`);
      return res.data;
    } catch (error) {
      console.error(error);
      return null; // Return null if there's an error
    }
  };

  // Function to handle the battle (comparison between two users)
  const handleBattle = async () => {
    setLoading(true); // Start loading spinner
    setBattleStarted(true); // Start the battle

    // Fetch both profiles concurrently
    const fetchedProfile1 = await fetchProfile(user1);
    const fetchedProfile2 = await fetchProfile(user2);

    // Update profiles after fetching
    setProfile1(fetchedProfile1);
    setProfile2(fetchedProfile2);

    // If both profiles are valid, send them to the backend
    if (fetchedProfile1 && fetchedProfile2) {
      try {
        const res = await axios.post('http://localhost:5000/generate', {
          userName1: user1,
          userData1: fetchedProfile1,
          userName2: user2,
          userData2: fetchedProfile2,
          task: 'evaluation', // Or 'legend' if it's a legend comparison
        });
        setResponse(res.data.message); // Set the generated response from the API
      } catch (error) {
        console.error(error);
        setResponse('Something went wrong'); // Error message if something goes wrong
      }
    } else {
      setResponse('Profiles are missing or invalid'); // If profiles are invalid or missing
    }

    setLoading(false); // Stop loading spinner
  };

  // Typewriter effect to display the response
  useEffect(() => {
    if (response) {
      let index = 0;
      setDisplayedResponse(''); // Reset displayed response
      const intervalId = setInterval(() => {
        setDisplayedResponse((prev) => prev + response[index]);
        index++;
        if (index === response.length) {
          clearInterval(intervalId);
        }
      }, 50); // Adjust the typing speed (in milliseconds)
      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [response]);

  // Function to format the response with bold usernames (without markdown)
  const formatResponse = (text) => {
    // First, apply bold to the usernames
    text = text.replace(/([a-zA-Z0-9_]+):/g, (match, p1) => {
      return `<strong>${p1}</strong>:`; // Bold the username
    });
  
    // Add a line break and space between users' responses
    text = text.replace(/(<strong>[a-zA-Z0-9_]+<\/strong>:.*?)(?=<strong>[a-zA-Z0-9_]+<\/strong>:|$)/g, (match, p1) => {
      return `${p1}<br /><br />`; // Add two <br /> tags after the first user's message
    });
  
    return text;
  };
  

  return (
    <div className="container">
      <header className="header">
        <h1>🔥 Github Battle Roast 🔥</h1>
        <a href="/legendary-royale" className="legendary-link">Try Legendary Royale! 🔥</a>
      </header>
      <main className="main-content">
        <div className="profiles">
          <div className="profile">
            <input
              type="text"
              placeholder="GitHub Username 1"
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
            />
            <div className="profile-details">
              <img
                src={battleStarted && profile1 ? profile1.avatar_url : image1}
                alt="Avatar"
                className="avatar"
              />
            </div>
          </div>
          <div className="vs">VS</div>
          <div className="profile">
            <input
              type="text"
              placeholder="GitHub Username 2"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
            />
            <div className="profile-details">
              <img
                src={battleStarted && profile2 ? profile2.avatar_url : image2}
                alt="Avatar"
                className="avatar"
              />
            </div>
          </div>
        </div>
        <div className="actions">
          <button 
            onClick={handleBattle} 
            className="battle-button" 
            disabled={loading} // Disable button during loading
          >
            {loading ? 'Loading...' : 'Let\'s Go'}
          </button>
          <button
            onClick={() => {
              setUser1('');
              setUser2('');
              setProfile1(null);
              setProfile2(null);
              setResponse('');
              setDisplayedResponse('');
              setBattleStarted(false);
            }}
            className="reset-button"
            disabled={loading} // Disable reset button during loading
          >
            Reset
          </button>
        </div>
        <div className="response">
          <h3>Response 🔥</h3>
          <div className="response-container">
            {displayedResponse ? (
              <p
                dangerouslySetInnerHTML={{
                  __html: formatResponse(displayedResponse), // Format response with bold usernames
                }}
              />
            ) : (
              <img src={animeSVG} alt="Anime SVG" className="anime-svg" /> // Display your SVG when no response
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
