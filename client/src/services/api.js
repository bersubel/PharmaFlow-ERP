import axios from "axios";


const api = axios.create({

    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    headers: {

        "Content-Type":
            "application/json",

    },

});


// ============================================
// ADD TOKEN TO EVERY REQUEST
// ============================================

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem("token");


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// ============================================
// HANDLE AUTH ERRORS
// ============================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        /*
         * Do NOT automatically logout here.
         *
         * A 401 from one endpoint should not
         * destroy the whole frontend session
         * while we're debugging permissions.
         */

        return Promise.reject(error);

    }

);


export default api;