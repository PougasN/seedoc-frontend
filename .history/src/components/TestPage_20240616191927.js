import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './TestPage.css';

const TestPage = () => {

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:9090/patients');
                if (!response.ok) {
                    throw new Error('Error with response...')
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Loading...</div>;
    
    const goToPatientPage = () => {
        navigate('/patients');
    };

    return (
        <div>
            <h1>Test Header</h1>
            <button onClick={goToPatientPage}>Go to Patient Page</button>
            <pre>{JSON.stringify(data,null,2)}</pre>
            <h2>List View</h2>
            <ol>
                {data.map((item, index) => (
                <li key={index}>{item.name}</li>
                ))}
            </ol>
        </div>
    );
};

export default TestPage;