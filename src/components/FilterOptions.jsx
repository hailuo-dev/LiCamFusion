import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, Clock, Video, Search, AlertTriangle } from 'lucide-react';
import { format, parse } from 'date-fns';

const FilterOptions = ({
  options,
  onChange,
  scannedCount,
  filteredCount,
  disabled,
  sourceDir,
  onScanFiles
}) => {
  const handleDateChange = (dateString) => {
    onChange({ selectedDate: dateString });
  };

  const handleHourChange = (value) => {
    onChange({ selectedHour: value[0] });
  };

  const handleAngleChange = (value) => {
    onChange({ selectedAngle: value });
  };

  const handleCheckboxChange = (field) => (checked) => {
    onChange({ [field]: checked });
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (options.byDate) activeFilters.push(`日期: ${options.selectedDate}`);
    if (options.byHour) activeFilters.push(`时间: ${options.selectedHour}时`);
    if (options.byAngle) activeFilters.push(`视角: ${options.selectedAngle === 'F' ? '前视角' : '所有视角'}`);
    
    if (activeFilters.length === 0) return '无筛选条件';
    return activeFilters.join(' + ');
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Filter className="h-5 w-5" />
          筛选条件设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 筛选选项 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 日期筛选 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={options.byDate}
                onCheckedChange={handleCheckboxChange('byDate')}
                disabled={disabled}
                id="date-filter"
              />
              <label
                htmlFor="date-filter"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-blue-400" />
                按日期筛选
              </label>
            </div>
            {options.byDate && (
              <div className="pl-6">
                <input
                  type="date"
                  value={options.selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* 时间筛选 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={options.byHour}
                onCheckedChange={handleCheckboxChange('byHour')}
                disabled={disabled}
                id="hour-filter"
              />
              <label
                htmlFor="hour-filter"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <Clock className="h-4 w-4 text-green-400" />
                按小时筛选
              </label>
            </div>
            {options.byHour && (
              <div className="pl-6 space-y-3">
                <div className="text-sm text-blue-400">
                  时间: {options.selectedHour}:00
                </div>
                <Slider
                  value={[options.selectedHour]}
                  onValueChange={handleHourChange}
                  max={23}
                  step={1}
                  disabled={disabled}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0时</span>
                  <span>6时</span>
                  <span>12时</span>
                  <span>18时</span>
                  <span>23时</span>
                </div>
              </div>
            )}
          </div>

          {/* 视角筛选 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={options.byAngle}
                onCheckedChange={handleCheckboxChange('byAngle')}
                disabled={disabled}
                id="angle-filter"
              />
              <label
                htmlFor="angle-filter"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <Video className="h-4 w-4 text-purple-400" />
                按视角筛选
              </label>
            </div>
            {options.byAngle && (
              <div className="pl-6">
                <Select value={options.selectedAngle} onValueChange={handleAngleChange} disabled={disabled}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择视角" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">📹 前视角 (F)</SelectItem>
                    <SelectItem value="A">🎥 所有视角 (A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* 筛选结果统计 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-background/30 rounded-lg border border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{scannedCount}</div>
            <div className="text-xs text-muted-foreground">已扫描文件</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${filteredCount > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {filteredCount}
            </div>
            <div className="text-xs text-muted-foreground">符合条件</div>
          </div>
          <div className="col-span-2 lg:col-span-1 lg:text-center">
            <div className="text-xs text-muted-foreground mb-1">当前筛选条件</div>
            <Badge variant="secondary" className="text-xs">
              {getFilterSummary()}
            </Badge>
          </div>
        </div>

        {/* 扫描按钮 */}
        <div className="pt-4 border-t border-border/30">
          <Button
            onClick={onScanFiles}
            disabled={!sourceDir || disabled}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Search className="mr-2 h-4 w-4" />
            <Video className="mr-2 h-4 w-4" />
            扫描视频文件
          </Button>
        </div>

        {/* 提示信息 */}
        {scannedCount > 0 && filteredCount === 0 && (
          <div className="flex items-start gap-3 p-4 bg-yellow-950/20 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-yellow-400">没有找到符合条件的文件</div>
              <div className="text-xs text-yellow-300/80 mt-1">请调整筛选条件或检查文件命名格式</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterOptions;
