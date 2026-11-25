import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PlinkoGame from '../playtest/PlinkoGame';
import ScratchGame from '../playtest/ScratchGame';
import SlingGame from '../playtest/SlingGame';
import StackGame from '../playtest/StackGame';
import TwinGame from '../playtest/TwinGame';
import '../styles/playtest.css';

const OTHER_GAMES = {
    plinko: PlinkoGame,
    stack: StackGame,
    sling: SlingGame,
    scratch: ScratchGame,
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
                {OtherGame ? <OtherGame key={gameId} /> : <TwinGame />}
            </div>
        </div>
    );
}
