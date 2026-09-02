import React from 'react';
import '../../styles/gameBoard.css';
import spriteCardsImg from '../../assets/unoSprite.jpeg';

const getCardIndex = (color, value) => {
    // Check special wild cards first
    const isSpecial = !color || color === 'none' || value === 'wild' || value === 'wild_draw_four';

    let linearIndex = 0;

    if (isSpecial) {
        if (value === 'wild_draw_four') linearIndex = 52;
        else linearIndex = 53; // 'wild'
    } else {
        let colorOffset = 0;
        switch (color) {
            case 'red': colorOffset = 0; break;
            case 'blue': colorOffset = 13; break;
            case 'green': colorOffset = 26; break;
            case 'yellow': colorOffset = 39; break;
            default: colorOffset = 0;
        }

        let valueOffset = 0;
        if (value === 'draw_two') valueOffset = 10;
        else if (value === 'reverse') valueOffset = 11;
        else if (value === 'skip') valueOffset = 12; // Block
        else valueOffset = parseInt(value, 10) || 0;

        linearIndex = colorOffset + valueOffset;
    }

    // Grid: 6 rows * 10 columns
    const row = Math.floor(linearIndex / 10);
    const col = linearIndex % 10;

    return { row, col };
};

const getSpriteConfig = (color, value) => {
    const { row, col } = getCardIndex(color, value);

    const cardWidth = 90;
    const cardHeight = 136;
    
    // Background size is 10 cols by 6 rows
    const bgWidth = cardWidth * 10;
    const bgHeight = cardHeight * 6;

    return {
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        bgSize: `${bgWidth}px ${bgHeight}px`,
        bgPosX: `-${col * cardWidth}px`,
        bgPosY: `-${row * cardHeight}px`
    };
};

const UnoCard = ({ card, onClick, isPlayable, hidden }) => {
    if (hidden) {
        return (
            <div className="uno-card uno-card--hidden" onClick={() => onClick && onClick(null)} style={{ width: '90px', height: '136px' }}>
                <div className="uno-card__back">UNO</div>
            </div>
        );
    }

    if (!card) return null;

    const { color, value } = card;
    const { width, height, bgSize, bgPosX, bgPosY } = getSpriteConfig(color, value);

    return (
        <button 
            className={`uno-card ${isPlayable ? 'uno-card--playable' : ''}`}
            onClick={() => onClick && onClick(card)}
            disabled={!onClick}
            style={{
                width,
                height,
                backgroundImage: `url(${spriteCardsImg})`,
                backgroundPosition: `${bgPosX} ${bgPosY}`,
                backgroundSize: bgSize
            }}
        >
            <div className="uno-card__fallback-label" style={{ 
                background: color === 'none' || !color ? '#333' : color,
                color: 'white' 
            }}>
                {value}
            </div>
        </button>
    );
};

export default UnoCard;
