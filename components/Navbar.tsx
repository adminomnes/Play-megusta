'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X, User, Heart } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
        }
    };

    const navLinks = [
        { name: 'Inicio', href: '/' },
        { name: 'Películas', href: '/movies' },
        { name: 'Series', href: '/tv' },
        { name: 'Kids', href: '/kids' },
        { name: 'Radio & TV', href: '/radio' },
        { name: 'Mi Lista', href: '/my-list' },
        { name: 'Continuar viendo', href: '/continue' },
    ];

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <Link href="/" className={styles.logo}>
                        <img
                            src="https://i.ibb.co/bMjJ6QCz/Chat-GPT-Image-8-feb-2026-22-26-29-removebg-preview.png"
                            alt="Play Me Gusta Logo"
                            className={styles.logoImage}
                        />
                    </Link>

                    <ul className={styles.navLinks}>
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={pathname === link.href ? styles.active : ''}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.right}>
                    <a
                        href="https://app.radiomegusta.cl/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.listenBtn}
                    >
                        Escuchanos
                    </a>

                    <div className={`${styles.searchBox} ${searchOpen ? styles.open : ''}`}>
                        <form onSubmit={handleSearch}>
                            <button
                                type="button"
                                onClick={() => setSearchOpen(!searchOpen)}
                                className={styles.iconBtn}
                            >
                                <Search size={22} />
                            </button>
                            <input
                                type="text"
                                placeholder="Títulos, personas, géneros..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus={searchOpen}
                            />
                        </form>
                    </div>

                    <Link href="/my-list" className={styles.iconBtn}>
                        <Heart size={22} />
                    </Link>

                    <button className={styles.iconBtn} onClick={() => setIsMenuOpen(true)}>
                        <Menu size={26} className={styles.mobileOnly} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.menuOpen : ''}`}>
                <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)}>
                    <X size={32} />
                </button>
                <div className={styles.mobileLogo}>
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                        PLAY ME GUSTA
                    </Link>
                </div>
                <ul className={styles.mobileLinks}>
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={pathname === link.href ? styles.active : ''}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
