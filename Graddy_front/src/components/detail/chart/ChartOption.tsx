// ChartOption.tsx
import { ChartOptions } from 'chart.js';

// 라인 차트 옵션
export const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      }
    },
    title: {
      display: true,
      text: '라인 차트 예시',
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#fff',
      borderWidth: 1,
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'X축 라벨'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Y축 라벨'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      beginAtZero: true
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};

// 바 차트 옵션
export const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: '바 차트 예시'
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  }
};

// 파이 차트 옵션
export const pieChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        padding: 20,
        usePointStyle: true
      }
    },
    title: {
      display: true,
      text: '파이 차트 예시'
    }
  }
};

// 도넛 차트 옵션
export const doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: true,
      text: '도넛 차트 예시'
    }
  },
  cutout: '50%'
};

// 공통 색상 팔레트 (Chart.js용)
export const chartColors = {
  primary: '#3B82F6',
  secondary: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280'
};

// 색상 배열 (여러 데이터셋용)
export const colorPalette = [
  'rgba(59, 130, 246, 0.8)',   // blue
  'rgba(239, 68, 68, 0.8)',    // red
  'rgba(16, 185, 129, 0.8)',   // green
  'rgba(245, 158, 11, 0.8)',   // yellow
  'rgba(139, 92, 246, 0.8)',   // purple
  'rgba(236, 72, 153, 0.8)',   // pink
  'rgba(6, 182, 212, 0.8)',    // cyan
  'rgba(107, 114, 128, 0.8)'   // gray
];

// 테마별 옵션
export const darkThemeOptions: Partial<ChartOptions> = {
  plugins: {
    legend: {
      labels: {
        color: '#ffffff'
      }
    },
    title: {
      color: '#ffffff'
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#ffffff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    y: {
      ticks: {
        color: '#ffffff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
};

// ===== Recharts용 설정 추가 =====

// Recharts용 색상 팔레트
export const colors = {
  primary: '#3B82F6',
  secondary: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280'
};

// LineChart 마진 설정
export const lineChartMargin = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 5
};

// XAxis 설정
export const xAxisConfig = {
  tick: { fontSize: 12 },
  stroke: "#666"
};

// YAxis 설정
export const yAxisConfig = {
  tick: { fontSize: 12 },
  stroke: "#666"
};

// Grid 설정
export const gridConfig = {
  strokeDasharray: "3 3",
  stroke: "#f0f0f0"
};

// Tooltip 설정
export const tooltipConfig = {
  contentStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    border: '1px solid #ffffff',
    borderRadius: '4px'
  },
  labelStyle: { color: '#ffffff' }
};

// Line 스타일 설정
export const lineStyles = {
  default: {
    type: 'monotone' as const,
    strokeWidth: 2,
    dot: { r: 4, strokeWidth: 2 },
    activeDot: { r: 6, strokeWidth: 2 }
  },
  smooth: {
    type: 'monotone' as const,
    strokeWidth: 3,
    dot: false,
    activeDot: { r: 5 }
  }
};

// Chart.js용 샘플 데이터
export const sampleChartData = {
  labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
  datasets: [
    {
      label: '데이터 1',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: chartColors.primary,
      backgroundColor: colorPalette[0],
      tension: 0.1,
    },
    {
      label: '데이터 2', 
      data: [2, 3, 20, 5, 1, 4],
      borderColor: chartColors.secondary,
      backgroundColor: colorPalette[1],
      tension: 0.1,
    }
  ]
};