import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './TestPage.css';

const TestPage = () => {

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:9090/patients');
                if (!response.ok) {
                    throw new Error('Error with response...')
                }
                const result = await response.json();
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, []);
    
    const goToPatientPage = () => {
        navigate('/patients');
    };

    return (
        <div>
            <h1>Test Header</h1>
            <button onClick={goToPatientPage}>Go to Patient Page</button>
        </div>
    );
};

export default TestPage;