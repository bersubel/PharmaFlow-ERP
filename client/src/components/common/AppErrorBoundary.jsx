import {
    Component,
} from "react";

import {
    Leaf,
    RefreshCw,
} from "lucide-react";


class AppErrorBoundary extends Component {

    constructor(props) {

        super(props);

        this.state = {
            error: null,
        };

    }


    static getDerivedStateFromError(error) {

        return {
            error,
        };

    }


    render() {

        if (this.state.error) {

            return (

                <main className="app-error-screen">

                    <div className="app-error-card">

                        <div className="app-error-icon">
                            <Leaf size={27} />
                        </div>

                        <p className="app-error-eyebrow">
                            PHARMAFLOW ERP
                        </p>

                        <h1>
                            We could not load this page.
                        </h1>

                        <p>
                            Refresh the page to try again. If the issue
                            continues, use the details below to identify it.
                        </p>

                        <button
                            type="button"
                            className="app-error-button"
                            onClick={() => window.location.reload()}
                        >

                            <RefreshCw size={17} />

                            Refresh page

                        </button>

                        <pre className="app-error-details">
                            {this.state.error.message}
                        </pre>

                    </div>

                </main>

            );

        }


        return this.props.children;

    }

}


export default AppErrorBoundary;
