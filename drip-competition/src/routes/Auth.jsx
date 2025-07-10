// Auth.jsx
import {useEffect, useState} from "react";
import "./Auth.css";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";
import {USER_SERVICE_URL} from "../utils/Constants.jsx";

export default function Auth({register = false}) {
    const navigator = useNavigate();
    const auth = useAuth();
    const [isRegister, setIsRegister] = useState(register);
    const [form, setForm] = useState({
        login: "",
        password: "",
        confirmPassword: "",
        name: "",
        phoneNumber: ""
    });
    const [error, setError] = useState(null);

    // useEffect(() => {
    //     if (auth.accessToken)
    //         navigator("/profile");
    // }, []);

    const toggleMode = () => {
        setIsRegister((prev) => !prev);
        setForm({login: "", password: "", confirmPassword: "", name: "", phoneNumber: ""});
        setError(null)
    };

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async () => {
        if (isRegister && form.password !== form.confirmPassword)
            return setError("Passwords dont match");

        if (isRegister) {
            try {
                const resp = await fetch(USER_SERVICE_URL + "/api/v1/auth/register", {
                    method: "POST",
                    body: {
                        email: form.login,
                        password: form.password,
                        name: form.name.split(" ")[1],
                        surname: form.name.split(" ")[0],
                        patronymic: form.name.split(" ")[2],
                        phoneNumber: form.phoneNumber
                    }
                });
                if (!resp.ok)
                    return setError("Failed to register: " + resp.status + " " + resp.statusText);
            } catch (e) {
                return setError("Failed to register: " + e);
            }
        }

        try {
            const resp = await (await fetch(USER_SERVICE_URL + "/api/v1/auth/login", {
                method: "POST",
                body: {
                    email: form.login,
                    password: form.password
                }
            })).json();

            if (!resp || !resp.token)
                return setError("Failed to login: " + resp);

            auth.setAccessToken(resp.token);
            navigator("/profile");
        } catch (e) {
            return setError("Failed to login: " + e);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">{isRegister ? "Регистрация" : "Авторизация"}</h2>
                <div className="error">{error}</div>

                <div className="auth-inputs">
                    <div className="input-group">
                        <label htmlFor="login">E-Mail</label>
                        <input
                            type="email"
                            id="login"
                            name="login"
                            value={form.login}
                            onChange={handleChange}
                            placeholder="example@domain.com"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>

                    {isRegister && (
                        <>
                            <div className="input-group">
                                <label htmlFor="confirmPassword">Повторите пароль</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="name">ФИО</label>
                                <input
                                    type="name"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="John Doe Doe"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="phoneNumber">Номер Телефона</label>
                                <input
                                    type="phoneNumber"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+78005553535"
                                />
                            </div>
                        </>
                    )}
                </div>

                <button className="auth-button" onClick={handleSubmit}>
                    {isRegister ? "Зарегистрироваться" : "Войти"}
                </button>

                <p className="auth-switch">
                    {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
                    <span onClick={toggleMode}>
                        {isRegister ? "Войти" : "Зарегистрироваться"}
                    </span>
                </p>
            </div>
        </div>
    );
}
