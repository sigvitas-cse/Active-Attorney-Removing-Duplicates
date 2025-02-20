import { useState } from "react";

const DataTableEliminated = ({ title, data }) => {
    const [showEliminated, setShowEliminated] = useState(false);

    const handleShowEliminated = () => {
        setShowEliminated(((previousValuetrue) => !previousValuetrue));
    }

    return (
        <>
            <div>
                <button style={{
                    backgroundColor: "yellow",
                    color: "black",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "15px",
                }} onClick={handleShowEliminated}>Show Eliminated Data</button>
            </div>
            {showEliminated && (
                <div>
                    <table>
                        <thead>
                            <tr>
                                {data.length > 0 && Object.keys(data[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} style={title.includes('Eliminated') ? { backgroundColor: '#ffe6e6' } : {}}>
                                    {Object.values(row).map((value, i) => (
                                        <td key={i}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

export default DataTableEliminated;
