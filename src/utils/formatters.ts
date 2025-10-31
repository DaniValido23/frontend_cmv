export const MONTHS_ES: Record<string, string> = {
  'January': 'Enero',
  'February': 'Febrero',
  'March': 'Marzo',
  'April': 'Abril',
  'May': 'Mayo',
  'June': 'Junio',
  'July': 'Julio',
  'August': 'Agosto',
  'September': 'Septiembre',
  'October': 'Octubre',
  'November': 'Noviembre',
  'December': 'Diciembre',
};

export type GroupBy = 'day' | 'week' | 'month' | 'year';

export const formatMoney = (value: number): string => {
  return Math.round(value).toLocaleString('es-MX');
};

export const formatDateLabel = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const dateStr = String(dateString);

    const datePart = dateStr.split('T')[0].split(' ')[0];
    const parts = datePart.split('-');

    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }

    return dateStr;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error formateando fecha:', error, dateString);
    }
    return String(dateString);
  }
};

export const formatLabel = (item: any, groupBy: GroupBy): string => {
  if (groupBy === 'day') {
    return formatDateLabel(item.date);
  } else if (groupBy === 'week') {
    return formatDateLabel(item.week_start);
  } else if (groupBy === 'month') {
    const monthInSpanish = MONTHS_ES[item.month_name] || item.month_name;
    return `${monthInSpanish} ${item.year}`;
  } else if (groupBy === 'year') {
    return `${item.year}`;
  }
  return '';
};

export interface ChartTooltipContext {
  parsed: {
    x: number;
    y: number;
  };
  dataIndex: number;
  dataset: any;
}

export interface ChartScaleContext {
  tick: {
    value: number;
  };
}
