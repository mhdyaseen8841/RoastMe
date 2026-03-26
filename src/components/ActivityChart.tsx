import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

const ActivityChart = ({ data }: ActivityChartProps) => {
  // Group data by weeks for the grid
  // We want 7 rows (days) and multiple columns (weeks)
  
  const getLevel = (count: number) => {
    if (count === 0) return 'bg-secondary/20';
    if (count <= 2) return 'bg-roast/30';
    if (count <= 4) return 'bg-roast/60';
    return 'bg-roast shadow-[0_0_10px_rgba(255,83,83,0.4)]';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Activity Heatmap</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-secondary/20" />
            <div className="w-2.5 h-2.5 rounded-sm bg-roast/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-roast/60" />
            <div className="w-2.5 h-2.5 rounded-sm bg-roast" />
          </div>
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div 
          className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-max"
          style={{ gridTemplateRows: 'repeat(7, 10px)' }}
        >
          {data.map((day) => (
            <TooltipProvider key={day.date}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div 
                    className={`w-[10px] h-[10px] rounded-[2px] transition-all hover:scale-125 hover:z-10 cursor-help ${getLevel(day.count)}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] py-1 px-2">
                  <span className="font-bold">{day.count} tasks</span> on {day.date}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between text-[9px] text-muted-foreground font-medium px-1">
        <span>3 Months Ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};

export default ActivityChart;
