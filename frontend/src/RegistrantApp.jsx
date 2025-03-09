// RegistrantApp.jsx

import { useState } from 'react'
import './RegistrantApp.css'

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="page-container">
      <header className="subtitle">
        <h1>UniPlan: Registrant's Homepage</h1>
        <nav className="topnav">
          <a className="active" href="#plan">Plan</a>
          <a href="#profile">Profile</a>
          <a href="#saved">Saved</a>
          <a href="#settings">Settings</a>
        </nav>
      </header>

      <div className="layout-wrapper">
        <aside className="requirements">
          <h2>Major Course Requirements</h2>
          {/* Eventually put draggable items here */}
        </aside>

        <main className="main-content">
          <h2>Your Planner</h2>
          <p>
            This is where you might show the schedule, drag courses, etc.
          </p>
        </main>
      </div>
    </div>
  );
}

export default App;