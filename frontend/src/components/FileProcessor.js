import React, { useState } from "react";
// import DataTableFilter from "./DataTableFilter";
import DataTableEliminated from "./DataTableEliminated";

const BACKEND_URL = process.env.REACT_APP_API_URL;
console.log(BACKEND_URL);

const FileProcessor = () => {
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkStatus, setCheckStatus] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      setCheckStatus(false);
      const response = await fetch(`${BACKEND_URL}/api/process-excel`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResults(data);
      setCheckStatus(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/download-excel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filteredData: results.filtered,
        }),
      });

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "filtered_data.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#333" }}>Attorney Data Processor</h2>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        disabled={isProcessing}
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ddd",
          cursor: "pointer",
          marginBottom: "15px",
        }}
      />
      {isProcessing && <p style={{ color: "black" }}>Processing file...</p>}

      {results && checkStatus ? (
        <div>
          <button
            onClick={handleDownload}
            style={{
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            Download Filtered Data (Excel)
          </button>

          <div
            style={{
              backgroundColor: "#f9f9f9",
              padding: "10px",
              borderRadius: "5px",
              marginTop: "10px",
            }}
          >
            <h3 style={{ color: "#28a745" }}>
              Filtered Rows: {results.filtered.length}
            </h3>
            <h3 style={{ color: "#dc3545" }}>
              Eliminated Rows: {results.eliminated.length}
            </h3>
          </div>

          <div>
            {/* <DataTableFilter title="Filtered Rows (Kept)" data={results.filtered} /> */}
            <DataTableEliminated title="Eliminated Rows" data={results.eliminated} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FileProcessor;
