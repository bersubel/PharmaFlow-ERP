import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";


export const AuthContext =
    createContext(null);


const AuthProvider = ({ children }) => {

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // ============================================
    // INITIALIZE AUTHENTICATION
    // ============================================

    useEffect(() => {

        const initializeAuth =
            async () => {

                const token =
                    localStorage.getItem(
                        "token"
                    );

                const savedUser =
                    localStorage.getItem(
                        "user"
                    );


                // --------------------------------
                // No token = not authenticated
                // --------------------------------

                if (!token) {

                    setUser(null);

                    setLoading(false);

                    return;

                }


                // --------------------------------
                // Restore cached user
                // --------------------------------

                if (savedUser) {

                    try {

                        const parsedUser =
                            JSON.parse(
                                savedUser
                            );

                        setUser(
                            parsedUser
                        );

                    } catch (error) {

                        console.error(
                            "Failed to parse saved user:",
                            error
                        );

                        localStorage.removeItem(
                            "user"
                        );

                    }

                }


                // --------------------------------
                // Try to verify the token
                // --------------------------------

                try {

                    /*
                     * Only use /auth/me if your
                     * backend actually provides
                     * this endpoint.
                     *
                     * If it doesn't exist, the
                     * cached user remains valid.
                     */

                    const response =
                        await api.get(
                            "/auth/me"
                        );


                    const currentUser =
                        response.data?.data?.user ||
                        response.data?.data;


                    if (currentUser) {

                        setUser(
                            currentUser
                        );


                        localStorage.setItem(

                            "user",

                            JSON.stringify(
                                currentUser
                            )

                        );

                    }

                } catch (error) {

                    console.warn(
                        "Could not verify authentication:",
                        error
                    );


                    /*
                     * IMPORTANT:
                     *
                     * Do NOT remove the token here.
                     *
                     * Your backend may not have
                     * /auth/me.
                     *
                     * We already have a valid token
                     * and cached user from login.
                     */

                    const currentSavedUser =
                        localStorage.getItem(
                            "user"
                        );


                    if (
                        currentSavedUser
                    ) {

                        try {

                            setUser(
                                JSON.parse(
                                    currentSavedUser
                                )
                            );

                        } catch {

                            setUser(null);

                        }

                    }

                } finally {

                    setLoading(false);

                }

            };


        initializeAuth();

    }, []);


    // ============================================
    // LOGIN
    // ============================================

    const login = async (
        email,
        password
    ) => {

        try {

            const response =
                await api.post(

                    "/auth/login",

                    {
                        email,
                        password,
                    }

                );


            const responseData =
                response.data;


            if (
                !responseData?.success
            ) {

                throw new Error(

                    responseData?.message ||
                    "Login failed"

                );

            }


            const loginData =
                responseData?.data;


            const loggedInUser =
                loginData?.user;


            const token =
                loginData?.token;


            // --------------------------------
            // Make sure backend returned token
            // --------------------------------

            if (!token) {

                throw new Error(
                    "Login successful but no authentication token was returned."
                );

            }


            // --------------------------------
            // Make sure backend returned user
            // --------------------------------

            if (!loggedInUser) {

                throw new Error(
                    "Login successful but no user information was returned."
                );

            }


            // --------------------------------
            // Save token
            // --------------------------------

            localStorage.setItem(
                "token",
                token
            );


            // --------------------------------
            // Save user
            // --------------------------------

            localStorage.setItem(
                "user",
                JSON.stringify(
                    loggedInUser
                )
            );


            // --------------------------------
            // Update React state
            // --------------------------------

            setUser(
                loggedInUser
            );


            return {

                success: true,

                user: loggedInUser,

                token,

            };

        } catch (error) {

            console.error(
                "Login failed:",
                error
            );


            throw error;

        }

    };


    // ============================================
    // LOGOUT
    // ============================================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );


        localStorage.removeItem(
            "user"
        );


        setUser(null);

    };


    // ============================================
    // AUTHENTICATION STATE
    // ============================================

    const isAuthenticated =
        Boolean(
            user &&
            localStorage.getItem(
                "token"
            )
        );


    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value = {

        user,

        loading,

        isAuthenticated,

        login,

        logout,

    };


    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );

};


// ============================================
// EXPORTS
// ============================================
//
// We export BOTH ways so your existing
// App.jsx will work whether it uses:
//
// import { AuthProvider } ...
//
// or:
//
// import AuthProvider ...
//
// ============================================

export {
    AuthProvider,
};


export default AuthProvider;

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};