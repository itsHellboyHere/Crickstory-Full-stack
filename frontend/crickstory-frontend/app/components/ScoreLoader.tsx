'use client';

import React from 'react';
import styles from '../css/CricketLoader.module.css';

const ScoreboardLoader = ({ text = 'LOADING' }: { text?: string }) => {
  return (
    <div className={styles.scoreboard}>
      {text.split('').map((char, idx) => (
        <div key={idx} className={styles.charBlock}>
          <span className={styles.char}>{char}</span>
        </div>
      ))}
    </div>
  );
};

export default ScoreboardLoader;
