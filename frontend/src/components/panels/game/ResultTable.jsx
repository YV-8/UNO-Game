import React from 'react';

const formatDate = (isoString) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
};

const ResultTable = ({ result }) => {
    if (!result) return null;

    return (
        <div className="game-card game-card--lila">
            <table className="game-card__table">
                <tbody>
                    {Object.entries(result).map(([key, value]) => {
                        let displayValue = typeof value === 'object' && value !== null 
                            ? JSON.stringify(value, null, 2) 
                            : String(value);
                            
                        if (key === 'createdAt' || key === 'updatedAt') {
                            displayValue = formatDate(value);
                        }
                        
                        return (
                            <tr key={key}>
                                <th>{key}</th>
                                <td>{displayValue}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ResultTable;
