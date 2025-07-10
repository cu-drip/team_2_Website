import {createContext, useContext, useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {USER_SERVICE_URL} from "../utils/Constants.jsx";

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({children}) => {
    const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
    const [accessToken, setRawAccessToken] = useState(cookies.accessToken);
    const [user, setUser] = useState(null);

    const setAccessToken = (token) => {
        if (!token) removeCookie("accessToken");
        else setCookie("accessToken", token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax"
        });
        setRawAccessToken(token);
    }

    const fetchUser = async () => {
        let userJson;
        try {
            userJson = await (await fetch(USER_SERVICE_URL + "/api/v1/auth/me", {
                headers: {
                    Authorization: "Bearer " + accessToken
                }
            })).json();
        } catch (e) {
            userJson = {
                "id": "5375dc7e-8ef7-4384-b95a-9cddf4b713e2",
                "name": "Alexandr05",
                "surname": "Gileta",
                "patronymic": null,
                "phoneNumber": "8005553535",
                "email": "gileta_tenis3@ya.ru",
                "hashedPassword": "$2a$10$iXbqsAYjp40ZHP74dqzACemgeQAhnPP58fuxZGDiS3ePSXBxK2l9y",
                "dateOfBirth": null,
                "age": null,
                "sex": null,
                "weight": null,
                "height": null,
                "createdAt": "2025-07-09T15:46:17.189333",
                "bio": null,
                "avatarUrl": null,
                "admin": true
            }
        }

        return userJson;
    }

    useEffect(() => {
        fetchUser().then((userJson) => setUser(userJson));
    }, []);

    const updateUser = (data) => {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        fetch(USER_SERVICE_URL + "/api/v1/auth/me", {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + accessToken
            },
            body: updatedUser
        });
    }

    return (
        <AuthContext.Provider value={{
            accessToken, setAccessToken,
            user, updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}