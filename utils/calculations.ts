
import { addDays, addWeeks, differenceInDays, addMonths, addYears, intervalToDuration } from 'date-fns';
import { Vaccine } from '../types';

export const calculateEDD = (lmpDate: Date): Date => {
  return addDays(lmpDate, 280);
};

export const calculateLMPFromEDD = (eddDate: Date): Date => {
  return addDays(eddDate, -280);
};

export const calculateLMPFromWeeks = (weeks: number, days: number): Date => {
  const totalDays = (weeks * 7) + days;
  return addDays(new Date(), -totalDays);
};

export const calculateGestationalAge = (lmpDate: Date) => {
  const today = new Date();
  const totalDays = differenceInDays(today, lmpDate);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return { weeks, days };
};

export const getPreciseDuration = (start: Date, end: Date) => {
  const duration = intervalToDuration({ start, end });
  return {
    years: duration.years || 0,
    months: duration.months || 0,
    days: duration.days || 0
  };
};

export const addDurationToDate = (date: Date, y: number, m: number, d: number) => {
  let result = addYears(date, y);
  result = addMonths(result, m);
  result = addDays(result, d);
  return result;
};

export const daysToYMD = (totalDays: number) => {
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30.44); // Average month length
  const days = Math.floor(remainingAfterYears % 30.44);
  return { years, months, days };
};

export const getVaccineSchedule = (birthDate: Date): Vaccine[] => {
  return [
    {
      name: 'BCG, OPV-0, Hep B-0',
      hindiName: 'बीसीजी, ओपीवी-0, हेप बी-0',
      dueDate: birthDate,
      age: 'At Birth',
      description: 'Given at birth or as soon as possible'
    },
    {
      name: 'Pentavalent 1, OPV 1, Rota 1, IPV 1, fIPV 1',
      hindiName: 'पेंटावैलेंट 1, ओपीवी 1, रोटा 1',
      dueDate: addWeeks(birthDate, 6),
      age: '6 Weeks',
      description: 'First dose of major vaccines'
    },
    {
      name: 'Pentavalent 2, OPV 2, Rota 2',
      hindiName: 'पेंटावैलेंट 2, ओपीवी 2, रोटा 2',
      dueDate: addWeeks(birthDate, 10),
      age: '10 Weeks',
      description: 'Second dose booster'
    },
    {
      name: 'Pentavalent 3, OPV 3, Rota 3, IPV 2, fIPV 2',
      hindiName: 'पेंटावैलेंट 3, ओपीवी 3, रोटा 3',
      dueDate: addWeeks(birthDate, 14),
      age: '14 Weeks',
      description: 'Third dose booster'
    },
    {
      name: 'MR 1st Dose, Vit A',
      hindiName: 'एमआर 1, विटामिन ए',
      dueDate: addDays(birthDate, 274), // ~9 months
      age: '9 Months',
      description: 'Measles-Rubella and Vitamin A'
    },
    {
      name: 'MR 2nd Dose, DPT Booster 1, OPV Booster',
      hindiName: 'एमआर 2, डीपीटी बूस्टर 1',
      dueDate: addDays(birthDate, 485), // ~16 months
      age: '16-24 Months',
      description: 'Booster doses'
    }
  ];
};
