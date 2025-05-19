import React from 'react';
import { Card, Tag, Progress } from 'antd';
import Chart from 'react-apexcharts';

const TaskGanttChart = ({ tasks, resources }) => {
  // 간트 차트 데이터 구성
  const series = tasks.map(task => {
    const resource = resources.find(r => r.id === task.resourceId);
    
    return {
      id: task.id,
      name: task.name,
      data: [
        {
          x: resource ? resource.name : '미할당',
          y: [
            new Date(task.startDate).getTime(),
            new Date(task.endDate).getTime()
          ],
          fillColor: task.status === 'completed' ? '#52c41a' : 
                    task.status === 'in-progress' ? '#1890ff' : '#d9d9d9',
          taskName: task.name,
          status: task.status,
          progress: task.progress,
          priority: task.priority
        }
      ]
    };
  });
  
  // 차트 옵션 설정
  const options = {
    chart: {
      height: 600,
      type: 'rangeBar',
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        dataLabels: {
          hideOverflowingLabels: false
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const data = opts.w.globals.initialSeries[opts.seriesIndex].data[opts.dataPointIndex];
        return data.taskName;
      },
      style: {
        colors: ['#fff']
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '14px'
        }
      }
    },
    tooltip: {
      custom: function({series, seriesIndex, dataPointIndex, w}) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        
        let statusText;
        switch (data.status) {
          case 'completed':
            statusText = '완료됨';
            break;
          case 'in-progress':
            statusText = '진행 중';
            break;
          case 'planned':
            statusText = '계획됨';
            break;
          default:
            statusText = data.status;
        }
        
        let priorityText;
        let priorityColor;
        switch (data.priority) {
          case 'high':
            priorityText = '높음';
            priorityColor = 'red';
            break;
          case 'medium':
            priorityText = '중간';
            priorityColor = 'orange';
            break;
          case 'low':
            priorityText = '낮음';
            priorityColor = 'blue';
            break;
          default:
            priorityText = data.priority;
            priorityColor = 'gray';
        }
        
        return `
          <div class="task-tooltip" style="padding: 10px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${data.taskName}</div>
            <div style="margin-bottom: 5px;">
              <span style="background-color: ${data.status === 'completed' ? '#52c41a' : data.status === 'in-progress' ? '#1890ff' : '#d9d9d9'}; 
                    color: white; padding: 2px 6px; border-radius: 3px;">${statusText}</span>
              <span style="background-color: ${priorityColor}; color: white; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">${priorityText}</span>
            </div>
            <div style="margin-bottom: 8px;">진행률: ${data.progress}%</div>
            <div>
              <div style="font-size: 12px; color: #666;">기간</div>
              <div>${new Date(data.y[0]).toLocaleDateString()} - ${new Date(data.y[1]).toLocaleDateString()}</div>
            </div>
          </div>
        `;
      }
    },
    grid: {
      row: {
        colors: ['#f3f4f5', '#fff'],
        opacity: 1
      }
    }
  };
  
  return (
    <div className="gantt-chart-container">
      <Chart
        options={options}
        series={series}
        type="rangeBar"
        height={600}
      />
    </div>
  );
};

export default TaskGanttChart;