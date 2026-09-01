import {
    BrowserRouter,
} from "react-router-dom";

import {
    AuthProvider,
} from "./context/AuthContext";

import AppRoutes
    from "./routes/AppRoutes";

import AppErrorBoundary
    from "./components/common/AppErrorBoundary";

const App = () => {

    return (

        <BrowserRouter>

            <AppErrorBoundary>

                <AuthProvider>

                    <AppRoutes />

                </AuthProvider>

            </AppErrorBoundary>

        </BrowserRouter>

    );

};


export default App;
