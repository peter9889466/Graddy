import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  lineChartOptions,
  chartColors,
  colorPalette
} from './ChartOption';

// Chart.js 구성 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 샘플 데이터
const sampleData = {
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

interface LineChartProps {
  data?: typeof sampleData;
  options?: typeof lineChartOptions;
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data = sampleData,
  options = lineChartOptions,
  width,
  height = 300
}) => {
  console.log('LineChart component is rendering');

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4" style={{ height: `${height}px` }}>
      <Line 
        data={data} 
        options={options}
        width={width}
        height={height}
      />
    </div>
  );
};

export default LineChart;