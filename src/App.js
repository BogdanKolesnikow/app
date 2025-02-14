import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

// Стили
const style = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#f5f5f5",
    height: "100vh",
    overflow: "hidden",
  },
  tableContainer: {
    flex: "1",
    maxWidth: "600px",
    marginRight: "20px",
    overflowY: "auto", 
    maxHeight: "80vh", 
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "10px",
    overflow: "hidden",
  },
  th: {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    background: "#007bff",
    color: "white",
  },
  td: {
    padding: "12px",
    border: "1px solid #ddd",
  },
  row: {
    cursor: "pointer",
    background: "#fff",
    transition: "0.3s",
  },
  rowHover: {
    background: "#f1f1f1",
  },
  dropAreaContainer: {
    flex: "0 0 350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  dropArea: {
    width: "100%",
    height: "450px",
    border: "2px dashed #007bff",
    background: "rgba(128, 128, 128, 0.4)",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: "16px",
    color: "#007bff",
    transition: "0.3s",
    flexDirection: "column",
    cursor: "pointer",
    position: "relative",
    overflowY: "auto", 
  },
  dropAreaActive: {
    background: "rgba(128, 128, 128, 0.6)",
  },
  fileInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  image: {
    maxWidth: "90%",
    maxHeight: "90%",
    marginTop: "10px",
    borderRadius: "5px",
  },
  mobile: {
    container: {
      flexDirection: "column",
      alignItems: "center",
      height: "auto",
    },
    tableContainer: {
      width: "90%",
      maxHeight: "60vh",
    },
    dropAreaContainer: {
      width: "90%",
      marginTop: "20px",
    },
    dropArea: {
      width: "100%",
      height: "300px",
    },
  },
};

function App() {
  const [records, setRecords] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/records")
      .then((res) => res.json())
      .then((data) => setRecords(data));

    socket.on("new_record", (record) => {
      setRecords((prev) => [record, ...prev]);
    });

    return () => socket.off("new_record");
  }, []);

  const addRecord = async () => {
    const res = await fetch("http://localhost:5000/api/records", { method: "POST" });
    const newRecord = await res.json();
    setRecords((prev) => [newRecord, ...prev]);
  };

  // Функции для Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Определяем, мобильное ли устройство
  const isMobile = window.innerWidth <= 768;
  const appliedStyle = isMobile ? style.mobile : style;

  return (
    <div style={{ ...style.container, ...(isMobile ? style.mobile.container : {}) }}>
      <div style={{ ...style.tableContainer, ...(isMobile ? style.mobile.tableContainer : {}) }}>
        <h2>База Данных:</h2>
        <table style={style.table}>
          <thead>
            <tr>
              <th style={style.th}>ID</th>
              <th style={style.th}>Дата</th>
              <th style={style.th}>Процент</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                onClick={addRecord}
                style={style.row}
                onMouseOver={(e) => (e.currentTarget.style.background = style.rowHover.background)}
                onMouseOut={(e) => (e.currentTarget.style.background = style.row.background)}
              >
                <td style={style.td}>{record.id}</td>
                <td style={style.td}>{record.created_at}</td>
                <td style={style.td}>{record.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Область для загрузки изображений */}
      <div
        style={{
          ...style.dropAreaContainer,
          ...(isMobile ? style.mobile.dropAreaContainer : {}),
        }}
      >
        <div
          style={{
            ...style.dropArea,
            ...(dragging ? style.dropAreaActive : {}),
            ...(isMobile ? style.mobile.dropArea : {}),
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <p>Перетащите или нажмите для выбора изображения</p>
          <input
            type="file"
            ref={fileInputRef}
            style={style.fileInput}
            accept="image/*"
            onChange={handleFileSelect}
          />
          {uploadedImage && <img src={uploadedImage} alt="Загруженное" style={style.image} />}
        </div>
      </div>
    </div>
  );
}

export default App;
