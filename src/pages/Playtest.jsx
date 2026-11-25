import { lazy, Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TwinGame from '../playtest/TwinGame';
import '../styles/playtest.css';

const OTHER_GAMES = {
    plinko: lazy(() => import('../playtest/PlinkoGame')),
    stack: lazy(() => import('../playtest/StackGame')),
    sling: lazy(() => import('../playtest/SlingGame')),
    scratch: lazy(() => import('../playtest/ScratchGame')),
};

export default function PlaytestPage() {
    const { gameId } = useParams();
    const OtherGame = gameId && gameId !== 'twin' ? OTHER_GAMES[gameId] : null;

    useEffect(() => {
        document.title = OtherGame ? 'Prize game · NARD' : 'Find the card · NARD';
        window.scrollTo(0, 0);
    }, [OtherGame]);

    return (
        <div className={`playtest ${OtherGame ? '' : 'playtest-match'}`}>
            <div className={`pt-wrap ${OtherGame ? '' : 'pt-wrap-match'}`}>
                {OtherGame ? (
                    <Suspense fallback={null}>
                        <OtherGame key={gameId} />
                    </Suspense>
                ) : (
                    <TwinGame />
                )}
            </div>
        </div>
    );
}
