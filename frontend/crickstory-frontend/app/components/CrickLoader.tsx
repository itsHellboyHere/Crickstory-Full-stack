'use client';

import React from 'react';
import styles from '../css/CricketLoader.module.css'

const CricketLoader = ({ size = 96, speed = 1.2 }: { size?: number; speed?: number }) => {
  const loaderStyle = {
    '--loader-size': `${size}px`,
    '--animation-speed': `${speed}s`,
  } as React.CSSProperties;

  return (
    <div className={styles.loaderContainer} style={loaderStyle}>
      <div className={styles.cricketBall}>
        <div className={styles.seam}></div>
        <div className={styles.stitches}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={styles.stitch}
              style={{ ['--angle' as any]: `${i * 60}deg` } as React.CSSProperties}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CricketLoader;