// RegistrantApp.jsx
import { useState } from 'react'
import './Registrant.css'

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







  
  //Code for Sean's boxes:
  //--------------------------------------------
  const [box1Items, setBox1Items] = useState([
    { id: 1, text: 'Course 1' },
    { id: 2, text: 'Course 2' },
    { id: 3, text: 'Course 3' },
    { id: 4, text: 'Course 4' },
    { id: 5, text: 'Course 5' }
  ]);

  // State for items in Box 2
  const [box2Items, setBox2Items] = useState([
    { id: 1, text: 'Elective 1' },
    { id: 2, text: 'Elective 2' },
    { id: 3, text: 'Elective 3' },
    { id: 4, text: 'Elective 4' },
    { id: 5, text: 'Elective 5' }
  ]);

  // Function to handle the start of a drag operation
  const handleDragStart = (e, item) => {
    // Set the data being dragged as
    // text/plain with the serialized item
    e.dataTransfer
      .setData('text/plain', JSON.stringify(item));
  };

  // Function to handle the drag over event
  const handleDragOver = (e) => {
    // Prevent the default behavior to allow dropping
    e.preventDefault();
  };

  // Function to handle the drop event
  const handleDrop = (e, targetBox) => {
    // Prevent the default behavior 
    // to avoid unwanted behavior
    e.preventDefault();

    // Parse the dropped item from the dataTransfer
    const droppedItem = JSON.parse(
      e.dataTransfer
        .getData('text/plain')
    );

    // Check the target box and 
    // update the state accordingly
    if (targetBox === 'box1') {
      // Check if the same item is already present in Box 1
      let isSameItemPresent = box1Items.some(
        item => item.id === droppedItem.id
          && item.text === droppedItem.text
      );

      // Update the state of Box 1 
      // and remove the item from Box 2
      setBox1Items((prevItems) =>
        //If the same item is already present in Box 1 then 
        //again don't add that item 
        // else add the new item in Box 1
        isSameItemPresent ?
          [...prevItems] :
          [...prevItems, droppedItem]
      );
      setBox2Items((prevItems) =>
        //Remove the dragged item from Box 2
        prevItems.filter(
          (item) =>
            item.id !== droppedItem.id
        )
      );
    } else if (targetBox === 'box2') {
      // Check if the same item is already present in Box 2
      let isSameItemPresent = box2Items.some(
        item => item.id === droppedItem.id
          && item.text === droppedItem.text
      );

      // Update the state of Box 2 and remove the item from Box 1
      setBox2Items((prevItems) =>
        //If the same item is already 
        // present in Box 2 then 
        //again don't add that item 
        // else add the new item in Box 2
        isSameItemPresent ?
          [...prevItems] :
          [...prevItems, droppedItem]
      );
      setBox1Items((prevItems) =>
        //Remove the dragged item from Box 1
        prevItems.filter(
          (item) =>
            item.id !== droppedItem.id
        )
      );
    }
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
          <h2>Major Course Requirements</h2>
          {/* Eventually put draggable items here */



            <div className="app-container">
            <div  className="box"
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, 'box1')}>
                <h3>Core Courses</h3>
                <ul>
                  {box1Items.map((item) => (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={
                        (e) =>
                          handleDragStart(e, item)
                      }>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="box"
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, 'box2')}>
                <h3>Electives</h3>
                <ul>
                  {
                    box2Items.map((item) => (
                      <li
                        key={item.id}
                        draggable
                        onDragStart={
                          (e) =>
                            handleDragStart(e, item)
                        }>
                        {item.text}
                      </li>
                    ))
                  }
                </ul>
              </div>


            </div>    


          }
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