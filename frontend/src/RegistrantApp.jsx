import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './RegistrantApp.css'

function App() {
  //const [count, setCount] = useState(0)
  const [showModal, setShowModal] = useState(false);

  return (
    <body className="centered-page">
    <header className="subtitle">
      <h1>UniPlan: Registrant's Homepage</h1>
      <div class="topnav">
        <a class="active" href="#plan">Plan</a>
        <a href="#profile">Profile</a>
        <a href="#saved">Saved</a>
        <a href="#settings">Settings</a>
      </div>
    </header>
    <aside>

    </aside>
  </body>
  );
}

export default App;
