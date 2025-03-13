// RegistrantApp.jsx
import { useState } from 'react'
import './Registrant.css'

// Collapsible Section Sub-Component
function collapsibleSection({title, items}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded((prev) => !(prev));
  };

  return (
    <div className="collapsible-section">
      {/* Button showing arrow and title */}
      <button className="collapsible-header" onClick={toggleExpand}>
        {expanded ? '▼' : '▶'} {title}
      </button>

      {/* If expanded, show the list of requirements */}
      {expanded && (
        <ul className="requirement-list">
          {items.map((item, idx) => (
            <li key={idx} draggable>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  // State for all semesters
  const [semesters, setSemesters] = useState([]);

  // State for controlling the modal’s visibility and edit mode
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [tempSemesterId, setTempSemesterId] = useState(null); // track which semester we're editing
  const [selectedType, setSelectedType] = useState('Fall');
  const [selectedYear, setSelectedYear] = useState('2025');

  // Open the modal in "Add" mode
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedType('Fall');
    setSelectedYear('2025');
    setTempSemesterId(null);
    setShowModal(true);
  };

  // Open the modal in "Edit" mode, prefill with existing semester data
  const handleOpenEditModal = (sem) => {
    setIsEditMode(true);
    setSelectedType(sem.type);
    setSelectedYear(sem.year);
    setTempSemesterId(sem.id);
    setShowModal(true);
  };

  // User clicks "Add" or "Save" in the modal
  const handleSaveSemester = () => {
    if (isEditMode && tempSemesterId != null) {
      // Update an existing semester
      setSemesters((prev) =>
        prev.map((sem) =>
          sem.id === tempSemesterId
            ? { ...sem, type: selectedType, year: selectedYear }
            : sem
        )
      );
    } else {
      // Add a new semester
      const newSem = {
        id: Date.now(),
        type: selectedType,
        year: selectedYear,
        courses: []
      };
      setSemesters((prev) => [...prev, newSem]);
    }

    // Close modal
    setShowModal(false);
  };

  // Clear the courses from a given semester
  const handleClearSemester = (id) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === id ? { ...sem, courses: [] } : sem
      )
    );
  };

  // Delete an entire semester
  const handleDeleteSemester = (id) => {
    setSemesters((prev) => prev.filter((sem) => sem.id !== id));
  };

  return (
    <div className="page-container">
      {/* HEADER */}
      <header className="subtitle">
        <h1>UniPlan: Registrant's Homepage</h1>
        <nav className="topnav">
          <a className="active" href="#plan">Plan</a>
          <a href="#profile">Profile</a>
          <a href="#saved">Saved</a>
          <a href="#settings">Settings</a>
        </nav>
      </header>

      {/* LAYOUT */}
      <div className="layout-wrapper">
        <aside className="requirements">
          {/* Your collapsible sections with dummy items */}
          <CollapsibleSection
            title="Degree Requirements"
            items={[
              'ENGL 100',
              'ENGL 110',
              'MATH 110',
              'MATH 111',
              'STATS 100',
              'STATS 160',
              'STATS 160'
            ]}
          />
          <CollapsibleSection
            title="Major Requirements"
            items={[
              'CS 110',
              'CS 115',
              'CS 210',
              'CS 201',
              'MATH 221',
              'MATH 122',
              'CS 215',
              'CS 280'
            ]}
          />
          <CollapsibleSection
            title="Electives"
            items={[
              'GEOL 102',
              'ASTRO 100',
              'BIOL 101',
              'PHYS 109',
              'ART 220',
              'ART 100',
              'PSYC 101'
            ]}
          />
        </aside>

        <main className="main-content">
          <h2>Your Planner</h2>
          <p>
            Add semesters, then drag courses (coming soon) from the left panel.
          </p>

          {/* Button that opens the modal to add a new semester */}
          <button onClick={handleOpenAddModal}>Add New Semester</button>

          {/* Render the semester boxes */}
          <div className="semesters-container">
            {semesters.map((sem) => (
              <div key={sem.id} className="semester-box">
                <div className="semester-header">
                  <h3>{sem.type} {sem.year}</h3>
                  <div className="dropdown-container">
                    <button className="dropdown-btn">⋮</button>
                    <div className="dropdown-content">
                      <button onClick={() => handleOpenEditModal(sem)}>Edit</button>
                      <button onClick={() => handleClearSemester(sem.id)}>Clear Courses</button>
                      <button onClick={() => handleDeleteSemester(sem.id)}>Delete</button>
                    </div>
                  </div>
                </div>

                <div className="course-dropzone">
                  Add Course
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* The Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{isEditMode ? 'Edit Semester' : 'New Semester'}</h2>

            <label>Type:&nbsp;</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Co-op">Co-op Workterm</option>
              <option value="Gap">Gap Semester</option>
            </select>
            <br /><br />

            <label>Year:&nbsp;</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2020"
              max="2100"
            />
            <br /><br />

            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSaveSemester}>
                {isEditMode ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}