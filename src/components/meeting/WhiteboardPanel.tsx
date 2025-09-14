import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/stores/roomStore';
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush } from 'fabric';
import { 
  X, 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Eraser, 
  Trash2,
  Palette,
  Minus
} from 'lucide-react';

export const WhiteboardPanel = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'rect' | 'circle' | 'erase'>('draw');
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(2);
  const { toggleWhiteboard } = useRoomStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 600,
      backgroundColor: '#1a1a1a',
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw' || activeTool === 'erase';
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === 'erase' ? '#1a1a1a' : brushColor;
      fabricCanvas.freeDrawingBrush.width = activeTool === 'erase' ? brushSize * 2 : brushSize;
    }
  }, [activeTool, brushColor, brushSize, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rect') {
      const rect = new Rect({
        left: 50,
        top: 50,
        width: 100,
        height: 60,
        stroke: brushColor,
        strokeWidth: 2,
        fill: 'transparent'
      });
      fabricCanvas.add(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 50,
        top: 50,
        radius: 40,
        stroke: brushColor,
        strokeWidth: 2,
        fill: 'transparent'
      });
      fabricCanvas.add(circle);
    }
  };

  const clearCanvas = () => {
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#1a1a1a';
      fabricCanvas.renderAll();
    }
  };

  const colors = [
    '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500'
  ];

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-card/95 backdrop-blur-sm border-l border-border/50 flex flex-col shadow-control">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h3 className="font-semibold text-foreground">화이트보드</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleWhiteboard}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tools */}
      <div className="p-4 border-b border-border/30">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button
            variant={activeTool === 'draw' ? 'control-active' : 'control'}
            size="icon"
            onClick={() => handleToolClick('draw')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'rect' ? 'control-active' : 'control'}
            size="icon"
            onClick={() => handleToolClick('rect')}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'circle' ? 'control-active' : 'control'}
            size="icon"
            onClick={() => handleToolClick('circle')}
          >
            <CircleIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'erase' ? 'control-active' : 'control'}
            size="icon"
            onClick={() => handleToolClick('erase')}
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        {/* Colors */}
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">색상</div>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 ${
                  brushColor === color ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBrushColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">굵기: {brushSize}px</div>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Clear */}
        <Button
          variant="control-danger"
          size="sm"
          onClick={clearCanvas}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          전체 지우기
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4">
        <div className="border border-border/30 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="block" />
        </div>
      </div>
    </div>
  );
};