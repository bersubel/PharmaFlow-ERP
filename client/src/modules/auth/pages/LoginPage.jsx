import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../../hooks/useAuth";

import "./LoginPage.css";


const LoginPage = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await login(
                form.email,
                form.password
            );

            navigate("/dashboard");

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                "Invalid email or password."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">

            <div className="login-background-shape login-shape-one" />
            <div className="login-background-shape login-shape-two" />


            <section className="login-brand-panel">

                <div className="login-brand">

                    <div className="login-logo">

                        <Leaf size={34} strokeWidth={2.2} />

                    </div>

                    <div>

                        <h1>
                            PharmaFlow
                        </h1>

                        <span>
                            HEALTHCARE ERP
                        </span>

                    </div>

                </div>


                <div className="login-brand-content">

                    <div className="login-leaf-icon">
                        <Leaf size={30} />
                    </div>

                    <h2>
                        Smarter pharmacy.
                        <br />
                        Healthier operations.
                    </h2>

                    <p>
                        Manage your pharmacy operations,
                        inventory, sales, purchases and
                        customers from one clean and
                        connected platform.
                    </p>

                </div>


                <div className="login-brand-footer">

                    <span>
                        PharmaFlow ERP
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        Healthcare Management System
                    </span>

                </div>

            </section>


            <section className="login-form-panel">

                <div className="login-form-container">

                    <div className="login-mobile-brand">

                        <div className="login-logo">
                            <Leaf size={28} />
                        </div>

                        <div>

                            <strong>
                                PharmaFlow
                            </strong>

                            <small>
                                HEALTHCARE ERP
                            </small>

                        </div>

                    </div>


                    <div className="login-heading">

                        <span className="login-welcome">
                            Welcome back
                        </span>

                        <h2>
                            Sign in to your account
                        </h2>

                        <p>
                            Enter your credentials to
                            continue to PharmaFlow.
                        </p>

                    </div>


                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="login-field">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="login-input-wrapper">

                                <Mail size={19} />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        <div className="login-field">

                            <div className="login-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>

                            </div>


                            <div className="login-input-wrapper">

                                <LockKeyhole size={19} />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    {showPassword
                                        ? <EyeOff size={19} />
                                        : <Eye size={19} />
                                    }

                                </button>

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign in"
                            }

                        </button>

                    </form>


                    <div className="login-security">

                        <LockKeyhole size={16} />

                        <span>
                            Secure access to your pharmacy
                            management system
                        </span>

                    </div>

                </div>

            </section>

        </div>

    );

};


export default LoginPage;