import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from 'react-router-dom'

import Auth from './routes/Auth'
import NotFound from './routes/NotFound'
import Profile from './routes/Profile'
import {CookiesProvider} from 'react-cookie'
import {AuthProvider} from "./contexts/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <CookiesProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/login?' element={<Auth register={false}/>}/>
                        <Route path='/register' element={<Auth register={true}/>}/>

                        <Route path='/profile' element={<Profile/>}/>

                        <Route path='*' element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </CookiesProvider>
    </StrictMode>
)
