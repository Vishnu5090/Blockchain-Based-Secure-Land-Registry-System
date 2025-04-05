// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css'; // You can keep the default styles or edit

function App() {
  const [blocks, setBlocks] = useState([]);
  const [formData, setFormData] = useState({
    ownerName: '',
    plotId: '',
    area: '',
    location: ''
  });

  useEffect(() => {
    loadBlockchain();
  }, []);

  const loadBlockchain = async () => {
    const res = await fetch('http://localhost:3001/blocks');
    const data = await res.json();
    setBlocks(data);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/mineBlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await res.json();

    if (res.ok) {
      alert('✅ Land Registered Successfully!');
      setFormData({ ownerName: '', plotId: '', area: '', location: '' });
      loadBlockchain();
    } else {
      alert('❌ Error: ' + (result.message || 'Something went wrong.'));
    }
  };

  return (
    <div className="App">
      <h1>Land Registry Blockchain</h1>

      <form onSubmit={handleSubmit} className="land-form">
        <input type="text" id="ownerName" placeholder="Owner Name" value={formData.ownerName} onChange={handleChange} required />
        <input type="text" id="plotId" placeholder="Plot ID" value={formData.plotId} onChange={handleChange} required />
        <input type="text" id="area" placeholder="Area (e.g., 1200 sqft)" value={formData.area} onChange={handleChange} required />
        <input type="text" id="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <button type="submit">Register Land</button>
      </form>

      <h2>Blockchain Blocks</h2>
      <div className="blocks">
        {blocks.map((block, idx) => (
          <div className="block" key={idx}>
            <strong>Index:</strong> {block.index}<br />
            <strong>Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}<br />
            <strong>Previous Hash:</strong> {block.previousHash}<br />
            <strong>Hash:</strong> {block.hash}<br />
            <strong>Data:</strong> {typeof block.data === 'object' ? JSON.stringify(block.data) : block.data}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
