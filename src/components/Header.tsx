import React from 'react';
import { Link } from 'react-router-dom';
const Header: React.FC = () => {
    return (
        <header className="bg-gray-900 text-white py-4 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">
                    Your Name
                </Link>
                <nav className="hidden md:flex gap-8">
                    <Link to="/" className="hover:text-blue-400">Home</Link>
                    <Link to="/about" className="hover:text-blue-400">About</Link>
                    <Link to="/experience" className="hover:text-blue-400">Experience</Link>
                    <Link to="/projects" className="hover:text-blue-400">Projects</Link>
                    <Link to="/contact" className="hover:text-blue-400">Contact</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;