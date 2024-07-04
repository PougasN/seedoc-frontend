import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './TestPage.css';

const TestPage = () => {

    const navigate = useNavigate();

    const [data, setData] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(true); // Set initial state to true
    const [error, setError] = useState(null);

    const [encData, setEncData] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:9090/patients');
                if (!response.ok) {
                    throw new Error('Error with response...');
                }
                const result = await response.json();
                console.log('Fetched data:', result); // Log the fetched data
                if (Array.isArray(result.entry)) { // Access the entry property
                    setData(result.entry); // Store the entry array in state
                } else {
                    throw new Error('Data is not an array');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const goToPatientPage = () => {
        navigate('/patients');
    };

    const getName = (name) => {
        if (!name || !Array.isArray(name) || name.length === 0) return "Unknown";
        const nameObj = name[0];
        return `${nameObj.given.join(' ')} ${nameObj.family}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:9090/patient/1/encounters');
                
            }
        }
    })

    return (
        <div>
            <h1>Test Header</h1>
            <button onClick={goToPatientPage}>Go to Patient Page</button>
            
            <h2>Patients Table</h2>
            {data.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Birth Date</th>
                            <th>Gender</th>
                            <th>Version Id</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.resource.id}</td>
                                <td>{getName(item.resource.name)}</td>
                                <td>{item.resource.birthDate}</td>
                                <td>{item.resource.gender}</td>
                                <td>{item.resource.meta.versionId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div>No data available</div>
            )}

            <h2>Encounters Table</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>status</th>                        
                    </tr>
                </thead>
                <tbody>
                // ENCOUNTERR DATA
                </tbody>
            </table>


        </div>
    );
};

export default TestPage;
