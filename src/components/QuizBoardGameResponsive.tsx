import React, { useState, useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import DesktopLayout from '../layouts/DesktopLayout';
import MobileLayout from '../layouts/MobileLayout';

const QuizBoardGameUnified: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const gameLogic = useGameLogic();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile ? (
        <MobileLayout {...gameLogic} />
    ) : (
        <DesktopLayout {...gameLogic} />
    );
};

export default QuizBoardGameUnified;
