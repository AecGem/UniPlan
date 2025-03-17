import { useState } from 'react'
import './Registrar.css'

const App = () => {
  // ---------- Drag-and-drop states ----------
  const [box1Items, setBox1Items] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
    { id: 4, text: 'Item 4' },
    { id: 5, text: 'Item 5' },
  ]);
  const [box2Items, setBox2Items] = useState([]);

  // ---------- Degree selection state ----------
  const [degree, setDegree] = useState("1");

  // ---------- Drag handlers ----------
  const handleDragStart = (e, item) => {
    // Serialize the dragged item as text
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDragOver = (e) => {
    // Must prevent default for drop to work
    e.preventDefault();
  };

  const handleDrop = (e, targetBox) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;

    const droppedItem = JSON.parse(raw);

    if (targetBox === 'box1') {
      // If item is already in Box1, skip
      const isDup = box1Items.some(
        (item) =>
          item.id === droppedItem.id && item.text === droppedItem.text
      );
      if (!isDup) {
        setBox1Items((prev) => [...prev, droppedItem]);
      }
      // Remove from Box2
      setBox2Items((prev) =>
        prev.filter((item) => item.id !== droppedItem.id)
      );
    } else if (targetBox === 'box2') {
      const isDup = box2Items.some(
        (item) =>
          item.id === droppedItem.id && item.text === droppedItem.text
      );
      if (!isDup) {
        setBox2Items((prev) => [...prev, droppedItem]);
      }
      setBox1Items((prev) =>
        prev.filter((item) => item.id !== droppedItem.id)
      );
    }
  };

  // ---------- Degree change handler ----------
  const handleDegreeChange = (newValue) => {
    setDegree(newValue);
  };

  return (
    <div className="page-container">
      {/* Header / Nav */}
      <header className="subtitle">
        <h1>UniPlan: Registrar's Homepage</h1>
        <div className="topnav">
          <a className="active" href="#plan">Plan</a>
          <a href="#profile">Profile</a>
          <a href="#saved">Saved</a>
          <a href="#settings">Settings</a>
        </div>
      </header>

      {/* Layout */}
      <div className="layout-wrapper">
        <div className="app-container">
          <div className="subtitle2">Select a Degree to View:</div>

          {/* Drop-down: picks which degree to show */}
          <div className="Degree-Dropdown">
            <label>Degree:&nbsp;</label>
            <select
              value={degree}
              onChange={(e) => handleDegreeChange(e.target.value)}
            >
              <option value="1">No Degree Selected</option>
              <option value="2">Computer Science</option>
              <option value="3">Empty Degree</option>
            </select>
          </div>

          <br /><br />

          {/* This container is hidden if "No Degree Selected" */}
          <div
            id="displayInfo"
            className="displayInfo"
            style={{
              visibility: degree === "1" ? "hidden" : "visible"
            }}
          >
            {degree === "2" && (
              <p>Showing Computer Science info here!</p>
            )}
            {degree === "3" && (
              <p>Showing “Empty Degree” info here!</p>
            )}
          </div>

          {/* 
             Example of the two draggable boxes, if you still need them:
             (You'd style them with .container, .box, etc. from your CSS)
          */}
          <div className="container">
            <div
              className="box"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'box1')}
            >
              <h4>Box 1</h4>
              <ul>
                {box1Items.map((item) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(ev) => handleDragStart(ev, item)}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="box"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'box2')}
            >
              <h4>Box 2</h4>
              <ul>
                {box2Items.map((item) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(ev) => handleDragStart(ev, item)}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
