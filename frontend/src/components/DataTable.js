// import { useState } from "react";

// const DataTable = ({ title, data }) => {
//     const [showFiltered, setShowFiltered] = useState(false);
//     const [showEliminated, setShowEliminated] = useState(false);

//     const handleShowFiltered = () => {
//         setShowFiltered(true);
//     }

//     const handleShowEliminated = () => {
//         setShowEliminated(true);
//     }

//     return (
//         <>
//             <div>
//                 <button onClick={handleShowFiltered}>Show Filtered Data</button>
//                 <button onClick={handleShowEliminated}>Show Eliminated Data</button>
//             </div>
//             {showFiltered && (
//                 <div>
//                     <h3>{title} ({data.length} records)</h3>
//                     <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
//                         <table className="data-table">
//                             <thead>
//                                 <tr>
//                                     {data.length > 0 && Object.keys(data[0]).map((key) => (
//                                         <th key={key}>{key}</th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                         </table>
//                     </div>
//                 </div>
//             )}
//             {showEliminated && (
//                 <div>
//                     <table>
//                         <tbody>
//                             {data.map((row, index) => (
//                                 <tr key={index} style={title.includes('Eliminated') ? { backgroundColor: '#ffe6e6' } : {}}>
//                                     {Object.values(row).map((value, i) => (
//                                         <td key={i}>{value}</td>
//                                     ))}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </>
//     );
// };

// export default DataTable;
