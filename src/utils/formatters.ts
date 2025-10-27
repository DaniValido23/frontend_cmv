// Mapa de traducción de meses a español
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

// Tipo para agrupación de datos
export type GroupBy = 'day' | 'week' | 'month' | 'year';

// Función para formatear dinero con separador de miles y sin decimales
export const formatMoney = (value: number): string => {
  return Math.round(value).toLocaleString('es-MX');
};

// Función para formatear fecha a DD-MM-YYYY
export const formatDateLabel = (dateString: string): string => {
  if (!dateString) return '';

  try {
    // Convertir a string por si acaso
    const dateStr = String(dateString);

    // Si la fecha viene como YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
    const datePart = dateStr.split('T')[0].split(' ')[0]; // Tomar solo la parte de fecha
    const parts = datePart.split('-');

    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }

    return dateStr;
  } catch (error) {
    console.error('Error formateando fecha:', error, dateString);
    return String(dateString);
  }
};

// Función para formatear labels según el tipo de agrupación
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

// Tipos para Chart.js
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
