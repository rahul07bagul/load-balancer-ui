import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [servers, setServers] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchServerData = () => {
    axios.get("http://localhost:8080/api/status")
      .then((response) => {
        setServers(response.data.servers);
        setLastUpdated(new Date());
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching server data:", err);
        setError("Failed to fetch server data.");
      });
  };

  useEffect(() => {
    fetchServerData();
    
    const intervalId = setInterval(fetchServerData, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const addServer = () => {
    axios.post("http://localhost:8080/api/add_server")
      .then(() => {
        fetchServerData();
      })
      .catch((err) => {
        console.error("Error adding server:", err);
        setError("Failed to add server.");
      });
  };

  const getStatusColor = (server) => {
    if (!server.healthy) return "#ffcdd2";
    if (server.cpu_usage > 80 || server.mem_usage > 80) return "#fff9c4";
    return "#c8e6c9";
  };
  
  return (
    <div className="dashboard-container">
      <h1>Load Balancer Dashboard</h1>
      
      <div className="controls">
        <button className="add-button" onClick={addServer}>
          <span className="plus-icon">+</span> Add Server
        </button>
        <div className="refresh-info">
          <button className="refresh-button" onClick={fetchServerData}>↻ Refresh</button>
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="server-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Host</th>
              <th>Port</th>
              <th>Status</th>
              <th>Requests</th>
              <th>Connections</th>
              <th>CPU</th>
              <th>Memory</th>
            </tr>
          </thead>
          <tbody>
            {servers.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No servers available</td>
              </tr>
            ) : (
              servers.map((server) => (
                <tr 
                  key={server.id} 
                  style={{ backgroundColor: getStatusColor(server) }}
                >
                  <td>{server.id}</td>
                  <td>{server.host}</td>
                  <td>{server.port}</td>
                  <td className="status-cell">
                    {server.healthy ? 
                      <span className="status-indicator healthy">✓</span> : 
                      <span className="status-indicator unhealthy">✗</span>}
                  </td>
                  <td>{server.requests.toLocaleString()}</td>
                  <td>{server.active_connections}</td>
                  <td className="usage-cell">
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{ 
                          width: `${server.cpu_usage}%`,
                          backgroundColor: server.cpu_usage > 80 ? '#f44336' : 
                                         server.cpu_usage > 60 ? '#ff9800' : '#4caf50'
                        }}
                      ></div>
                    </div>
                    <span>{Number(server.cpu_usage).toFixed(2)}%</span>
                  </td>
                  <td className="usage-cell">
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{ 
                          width: `${server.mem_usage}%`,
                          backgroundColor: server.mem_usage > 80 ? '#f44336' : 
                                         server.mem_usage > 60 ? '#ff9800' : '#4caf50'
                        }}
                      ></div>
                    </div>
                    <span>{Number(server.mem_usage).toFixed(2)}%</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .dashboard-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .add-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .add-button:hover {
          background-color: #388e3c;
        }
        
        .plus-icon {
          font-size: 18px;
          margin-right: 5px;
        }
        
        .refresh-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .refresh-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .refresh-button:hover {
          background-color: #1976d2;
        }
        
        .last-updated {
          color: #666;
          font-size: 0.9rem;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border-left: 4px solid #c62828;
        }
        
        .table-container {
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        
        .server-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        
        .server-table th {
          background-color: #2c3e50;
          color: white;
          padding: 12px 15px;
          text-align: left;
          font-weight: 500;
          position: sticky;
          top: 0;
        }
        
        .server-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #ecf0f1;
        }
        
        .server-table tr:last-child td {
          border-bottom: none;
        }
        
        .server-table tr:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .status-cell {
          text-align: center;
        }
        
        .status-indicator {
          display: inline-block;
          width: 24px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .status-indicator.healthy {
          background-color: #4caf50;
          color: white;
        }
        
        .status-indicator.unhealthy {
          background-color: #f44336;
          color: white;
        }
        
        .usage-cell {
          min-width: 100px;
        }
        
        .usage-bar {
          height: 8px;
          background-color: #ecf0f1;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        
        .usage-fill {
          height: 100%;
          transition: width 0.3s ease-out;
        }
        
        .no-data {
          text-align: center;
          padding: 30px;
          color: #7f8c8d;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default App;