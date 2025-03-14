// RegistrantApp.jsx
import { useState } from 'react'
import './Registrant.css'

// Collapsible Section Sub-Component
function CollapsibleSection({title, items, onDragStartAside}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
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
          {items.map((itemText, idx) => (
            <li 
              key={idx} 
              draggable
              onDragStart={(e) => onDragStartAside(e, itemText)}
            >
              {itemText}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
 /** ---------------------------
   *  SEMESTERS + COURSES STATE
   *  Each semester in 'semesters' has this shape:
   *  {
   *    id: number,
   *    type: string,   // "Fall", "Spring", etc.
   *    year: number,
   *    courses: [{ id: string, text: string }, ...]
   *  }
   *  The 'courses' array holds the courses the user has 
   *  dragged in. 
   * ---------------------------*/
  const [semesters, setSemesters] = useState([]);

  /** ---------------------------
   *  MODAL STATE (Add/Edit)
   * ---------------------------*/
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempSemesterId, setTempSemesterId] = useState(null); // track which semester we're editing
  const [selectedType, setSelectedType] = useState('Fall');
  const [selectedYear, setSelectedYear] = useState('2025');

  /** ---------------------------
   *  DRAG & DROP HANDLERS
   * ---------------------------*/
 // 1) Drag from the aside (strings only), converting it into 
  // an object { id, text } so we can store it in 'sem.courses'.
  const handleDragStartAside = (e, itemText) => {
    const payload = {
      course: { id: Date.now().toString(), text: itemText },
      sourceSemId: null,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  // 2) Drag from within a semester
  const handleDragStartSemester = (e, courseObj, sourceSemId) => {
    const payload = { course: courseObj, sourceSemId };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  // 3) onDragOver to allow dropping
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 4) onDrop: remove from old place and add to the new 
  // semester. The "targetSemId" is whichever semester was dropped onto.
  const handleDrop = (e, targetSemId) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return; 

    let payload;
    try {
      payload = JSON.parse(rawData);
    } catch (err) {
      return; // not valid data
    }

    const { course, sourceSemId } = payload;
    if (!course) return;

    // Update 'semesters' in local state
    setSemesters((prev) => {
      let updated = [...prev];

      // If it came from another semester, remove it from that semester's courses.
      if (sourceSemId) {
        updated = updated.map((sem) => {
          if (sem.id === sourceSemId) {
            return {
              ...sem,
              courses: sem.courses.filter((c) => c.id !== course.id),
            };
          }
          return sem;
        });
      }

      // Now add it to the target semester, if it's not already there
      updated = updated.map((sem) => {
        if (sem.id === targetSemId) {
          // Check duplicates
          const alreadyThere = sem.courses.some((c) => c.id === course.id);
          if (!alreadyThere) {
            return {
              ...sem,
              courses: [...sem.courses, course],
            };
          }
        }
        return sem;
      });

      // If we wanted to persist changes to the DB, we could do a fetch POST/PUT:
      //   fetch(`/api/semesters/${targetSemId}`, { ... })
      // so the backend stores the new course arrangement.

      return updated;
    });
  };


  /** ---------------------------
   *  HELPER: Remove Single Course
   * ---------------------------*/
  const removeSingleCourse = (semesterId, courseId) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? {
              ...sem,
              courses: sem.courses.filter((c) => c.id !== courseId),
            }
          : sem
      )
    );
  };

  /** ---------------------------
   *  SEMESTER MODAL HANDLERS
   * ---------------------------*/
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedType('Fall');
    setSelectedYear('2025');
    setTempSemesterId(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (sem) => {
    setIsEditMode(true);
    setSelectedType(sem.type);
    setSelectedYear(sem.year);
    setTempSemesterId(sem.id);
    setShowModal(true);
  };

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
    setShowModal(false);
  };

  const handleClearSemester = (id) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === id ? { ...sem, courses: [] } : sem
      )
    );
  };

  const handleDeleteSemester = (id) => {
    setSemesters((prev) => prev.filter((sem) => sem.id !== id));
  };

  
  /** ---------------------------
   *  RENDER
   * ---------------------------*/
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
          {/* 
            Collapsible sections with dummy arrays. 
            This is where the BACKEND can supply real data. 
            For instance:
              fetch('/api/courses?type=degree')
              .then(...).then(data => setDegreeCourses(data)) 
            Then pass setDegreeCourses into CollapsibleSection 
            as 'items={degreeCourses}'.
          */}
          <CollapsibleSection
            title="Degree Requirements"
            items={[
              'Degree Class 1',
              'Degree Class 2',
              'Degree Class 3',
              'Degree Class 4'
            ]}
            onDragStartAside={handleDragStartAside}
          />
          <CollapsibleSection
            title="Major Requirements"
            items={[
              'Major Class 1',
              'Major Class 2',
              'Major Class 3',
              'Major Class 4'
            ]}
            onDragStartAside={handleDragStartAside}
          />
          <CollapsibleSection
            title="Electives"
            items={[
              'Elective 1',
              'Elective 2',
              'Elective 3',
              'Elective 4'
            ]}
            onDragStartAside={handleDragStartAside}
          />
          <CollapsibleSection
            title="Co-op Workterm"
            items={[
              'Workterm 1',
              'Workterm 2',
              'Workterm 3',
              'Workterm 4'
            ]}
            onDragStartAside={handleDragStartAside}
          />
        </aside>

        <main className="main-content">
          <h2>Your Planner</h2>
          <p>
            Add semesters, then drag courses from the left panel.
          </p>

          <button onClick={handleOpenAddModal}>Add New Semester</button>

          {/* Semester Boxes */}
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

                {/* DRAG ZONE for dropping courses */}
                <div
                  className="course-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sem.id)}
                >
                  {sem.courses.length > 0 ? (
                    <ul className="semester-course-list">
                      {sem.courses.map((courseObj) => (
                        <li
                          key={courseObj.id}
                          draggable
                          onDragStart={(ev) => handleDragStartSemester(ev, courseObj, sem.id)}
                        >
                          {courseObj.text}
                          <button
                            className="delete-course-button"
                            onClick={() =>
                              removeSingleCourse(sem.id, courseObj.id)}
                              title="Delete Course"                
                            >
                              🗑 {/* wee little trashcan! :) */}
                            </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Add Course</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* MODAL: Add or Edit Semester */}
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