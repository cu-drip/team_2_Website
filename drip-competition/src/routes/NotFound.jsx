// NotFound.jsx
import {useNavigate} from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="nf-container">
            <div className="nf-card">
                <h1 className="nf-code">404</h1>
                <p className="nf-message">Страница не найдена</p>
                <button className="nf-button" onClick={() => navigate("/")}>
                    Вернуться на главную
                </button>
            </div>
        </div>
    );
}
