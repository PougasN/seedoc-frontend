import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './TestPage.css';

const TestPage = () => {

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:9090/patients')
            .then(Response => Response.json())
            .then(data => {

            })

    })
    
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