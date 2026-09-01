import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import "./MainLayout.css";


const MainLayout = () => {

    return (

        <div className="main-layout">

            {/* ================================
                SIDEBAR
            ================================= */}

            <Sidebar />


            {/* ================================
                MAIN AREA
            ================================= */}

            <div className="main-content">

                {/* TOPBAR */}

                <Topbar />


                {/* PAGE CONTENT */}

                <main className="page-content">

                    <Outlet />

                </main>

            </div>

        </div>

    );

};


export default MainLayout;