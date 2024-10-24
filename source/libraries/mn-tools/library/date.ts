export function formatDate(source: Date | number | string, fmt = '%d/%M/%Y %H:%m'): string {
  let date: Date;

  if (typeof source === 'number') {
    if (source < 10000000000) {
      date = new Date(1000 * source);
    } else {
      date = new Date(source);
    }
  } else if (typeof source === 'string') {
    date = new Date(source);
  } else {
    date = source;
  }

  function padStart(value: number): string {
    return value.toString().length < 2 ? `0${value}` : `${value}`;
  }

  return fmt.replace(/%([a-zA-Z]+)/g, (_: string, fmtCode: string) => {
    switch (fmtCode) {
      case 'd':
        return padStart(date.getDate());

      case 'M':
        return padStart(date.getMonth() + 1);

      case 'Y':
        return `${date.getFullYear()}`;

      case 'H':
        return padStart(date.getHours());

      case 'm':
        return padStart(date.getMinutes());

      case 's':
        return padStart(date.getSeconds());

      case 'Z':
        let min = -date.getTimezoneOffset();
        let h = Math.floor(min / 60);
        let m = min % 60;
        return (min > 0 ? '+' : '-') + padStart(h) + padStart(m);

      case 'W':
        return `${date.getWeekNumber()}`;

      default:
        throw new Error('Unsupported format code: ' + fmtCode);
    }
  });
}
