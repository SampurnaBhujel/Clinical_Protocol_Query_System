import logo from "../assets/logo.png";

export default function Footer() {
    return (
        <footer className="simple-footer">
            <p className="copyright">
                © {new Date().getFullYear()} Swasth-AI. All rights reserved.
            </p>

            <img src={logo} alt="Logo" className="footer-logo" />
        </footer>
    );
}