'use client';

import { useState, useEffect } from 'react';

export default function Counter() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Calculate everything client-side for accurate timezone handling
    const FIRST_TUESDAY = new Date(2026, 2, 10); // March 10, 2026
    const LAST_TUESDAY = new Date(2026, 11, 1);  // December 1, 2026

    // Get all tuesdays
    const tuesdays = [];
    const current = new Date(FIRST_TUESDAY);
    while (current <= LAST_TUESDAY) {
      tuesdays.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isTuesday = today.getDay() === 2;

    // Count passed
    let passed = 0;
    let currentTuesdayNumber = null;
    for (let i = 0; i < tuesdays.length; i++) {
      const t = tuesdays[i];
      if (t <= today) {
        passed++;
        if (
          isTuesday &&
          t.getFullYear() === today.getFullYear() &&
          t.getMonth() === today.getMonth() &&
          t.getDate() === today.getDate()
        ) {
          currentTuesdayNumber = i + 1;
        }
      }
    }

    const total = tuesdays.length;
    const remaining = total - passed;

    // Find next tuesday
    let nextTuesday = null;
    for (const t of tuesdays) {
      if (t > today) {
        nextTuesday = t;
        break;
      }
    }

    // Find last tuesday (most recent that has passed)
    let lastTuesday = null;
    let lastTuesdayNumber = null;
    for (let i = tuesdays.length - 1; i >= 0; i--) {
      if (tuesdays[i] <= today) {
        lastTuesday = tuesdays[i];
        lastTuesdayNumber = i + 1;
        break;
      }
    }

    setData({
      total,
      passed,
      remaining,
      isTuesday,
      currentTuesdayNumber,
      nextTuesday,
      lastTuesday,
      lastTuesdayNumber,
      progress: Math.round((passed / total) * 100),
    });
  }, []);

  if (!data) return null;

  const formatDate = (date) => {
    if (!date) return '';
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const getDaysUntilNext = () => {
    if (!data.nextTuesday) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.ceil((data.nextTuesday - today) / (1000 * 60 * 60 * 24));
    if (diff === 1) return 'Mañana es martes 🍻';
    return `Faltan ${diff} días para el próximo martes`;
  };

  return (
    <section className="counter-section animate-in">
      {data.isTuesday && data.currentTuesdayNumber ? (
        <div className="counter__today">
          <div className="counter__today-label">Hoy es el martes nro</div>
          <div className="counter__today-number">{data.currentTuesdayNumber}</div>
          <div className="counter__today-text">¡Nos vemos en Broders! 🍻</div>
        </div>
      ) : (
        <div className="counter__not-tuesday">
          <div className="counter__not-tuesday-text">
            {data.lastTuesdayNumber 
              ? `El último Broders fue el #${data.lastTuesdayNumber}`
              : 'Todavía no empezaron los Broders'
            }
          </div>
          {data.nextTuesday && (
            <div className="counter__not-tuesday-next">
              {getDaysUntilNext()}
            </div>
          )}
          {!data.nextTuesday && data.remaining === 0 && (
            <div className="counter__not-tuesday-next">
              ¡Se terminaron los Broders del año! 🎓
            </div>
          )}
        </div>
      )}

      <div className="counter__stats">
        <div className="counter__stat">
          <div className="counter__stat-number">{data.passed}</div>
          <div className="counter__stat-label">Martes idos</div>
        </div>
        <div className="counter__stat">
          <div className="counter__stat-number">{data.remaining}</div>
          <div className="counter__stat-label">Martes faltan</div>
        </div>
      </div>

      <div className="progress">
        <div className="progress__bar-container">
          <div
            className="progress__bar"
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <div className="progress__label">
          <span>10 de marzo</span>
          <span>{data.progress}%</span>
          <span>1 de diciembre</span>
        </div>
      </div>
    </section>
  );
}
