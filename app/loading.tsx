import React from 'react';
import SkeletonLoader from '@/components/SkeletonLoader';
import Navbar from '@/components/Navbar';

export default function Loading() {
    return (
        <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
            <Navbar />
            <SkeletonLoader type="hero" />
            <div style={{ marginTop: '-100px', position: 'relative' }}>
                <SkeletonLoader type="row" />
                <SkeletonLoader type="row" />
                <SkeletonLoader type="row" />
                <SkeletonLoader type="row" />
            </div>
        </main>
    );
}
