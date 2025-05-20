import React, { useEffect, useRef } from 'react';
import { Empty } from 'antd';

// 간단한 의존성 그래프 컴포넌트 (실제 구현에서는 vis.js, D3.js 등 사용)
const TaskDependencyGraph = ({ tasks }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || tasks.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);
    
    // 노드 위치 계산
    const nodeRadius = 30;
    const padding = 50;
    const maxNodesPerRow = 5;
    const nodeSpacingX = (width - 2 * padding) / Math.min(maxNodesPerRow, tasks.length);
    const nodeSpacingY = 150;
    
    const nodes = tasks.map((task, index) => {
      const row = Math.floor(index / maxNodesPerRow);
      const col = index % maxNodesPerRow;
      
      return {
        id: task.id,
        x: padding + col * nodeSpacingX + nodeSpacingX / 2,
        y: padding + row * nodeSpacingY + nodeSpacingY / 2,
        task
      };
    });
    
    // 노드 간 연결 (화살표) 그리기
    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 2;
    
    tasks.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) return;
      
      const targetNode = nodes.find(node => node.id === task.id);
      
      task.dependencies.forEach(depId => {
        const sourceNode = nodes.find(node => node.id === depId);
        if (!sourceNode || !targetNode) return;
        
        // 시작점과 끝점 계산
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
        const startX = sourceNode.x + nodeRadius * Math.cos(angle);
        const startY = sourceNode.y + nodeRadius * Math.sin(angle);
        const endX = targetNode.x - nodeRadius * Math.cos(angle);
        const endY = targetNode.y - nodeRadius * Math.sin(angle);
        
        // 화살표 그리기
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // 화살표 머리 그리기
        const arrowLength = 10;
        const arrowWidth = 5;
        
        const arrowAngle1 = angle + Math.PI / 7;
        const arrowAngle2 = angle - Math.PI / 7;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(arrowAngle1),
          endY - arrowLength * Math.sin(arrowAngle1)
        );
        ctx.lineTo(
          endX - arrowLength * Math.cos(arrowAngle2),
          endY - arrowLength * Math.sin(arrowAngle2)
        );
        ctx.closePath();
        ctx.fillStyle = '#1890ff';
        ctx.fill();
      });
    });
    
    // 노드 그리기
    nodes.forEach(node => {
      // 노드 원 그리기
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      
      // 상태에 따른 색상 지정
      switch (node.task.status) {
        case 'completed':
          ctx.fillStyle = '#52c41a';
          break;
        case 'in-progress':
          ctx.fillStyle = '#1890ff';
          break;
        default:
          ctx.fillStyle = '#d9d9d9';
      }
      
      ctx.fill();
      
      // 노드 텍스트 그리기
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.task.id, node.x, node.y);
      
      // 노드 아래에 작업명 표시
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(node.task.name, node.x, node.y + nodeRadius + 15, nodeSpacingX - 20);
    });
    
  }, [tasks]);
  
  return tasks.length > 0 ? (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600}
      style={{ width: '100%', height: 'auto' }}
    />
  ) : (
    <Empty 
      description="의존성 관계가 있는 작업이 없습니다." 
      style={{ marginTop: 100 }} 
    />
  );
};

export default TaskDependencyGraph;