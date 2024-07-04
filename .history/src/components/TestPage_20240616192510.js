import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './TestPage.css';

const TestPage = () => {

    const navigate = useNavigate();

    const [data, setData] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:9090/patients');
                if (!response.ok) {
                    throw new Error('Error with response...');
                }
                const result = await response.json();
                console.log('Fetched data:', result);
                 
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

    return (
        <div>
            <h1>Test Header</h1>
            <button onClick={goToPatientPage}>Go to Patient Page</button>
            
            <h2>Table View</h2>
            {data.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Condition</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.resource.id}</td>
                                <td>{item.resource.name}</td>
                                <td>{item.resource.age}</td>
                                <td>{item.resource.condition}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div>No data available</div>
            )}
        </div>
    );
};

export default TestPage;
