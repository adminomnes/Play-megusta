import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.socials}>
                <Facebook size={24} />
                <Instagram size={24} />
                <Twitter size={24} />
                <Youtube size={24} />
            </div>

            <div className={styles.links}>
                <div className={styles.column}>
                    <a href="#">Audio y subtítulos</a>
                    <a href="#">Media Center</a>
                    <a href="#">Privacidad</a>
                    <a href="#">Contáctanos</a>
                </div>
                <div className={styles.column}>
                    <a href="#">Descripción de audio</a>
                    <a href="#">Relaciones con inversionistas</a>
                    <a href="#">Avisos legales</a>
                </div>
                <div className={styles.column}>
                    <a href="#">Centro de ayuda</a>
                    <a href="#">Empleo</a>
                    <a href="#">Preferencias de cookies</a>
                </div>
                <div className={styles.column}>
                    <a href="#">Tarjetas de regalo</a>
                    <a href="#">Términos de uso</a>
                    <a href="#">Información corporativa</a>
                </div>
            </div>

            <button className={styles.serviceCode}>Código de servicio</button>

            <p className={styles.copyright}>© 1997-2024 Play Me Gusta, Inc. Powered by Radio Me Gusta</p>
        </footer>
    );
};

export default Footer;
