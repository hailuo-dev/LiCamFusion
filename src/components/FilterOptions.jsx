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
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg">
          <Filter className="h-5 w-5 text-black" />
        </div>
        <h2 className="text-xl font-bold text-white">智能筛选器</h2>
      </div>
      <div className="space-y-6">
        {/* 筛选选项 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 日期筛选 */}
          <div className="space-y-3 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={options.byDate}
                onCheckedChange={handleCheckboxChange('byDate')}
                disabled={disabled}
                id="date-filter"
              />
              <label
                htmlFor="date-filter"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer text-white"
              >
                <Calendar className="h-4 w-4 text-blue-300" />
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
                  className="w-full px-3 py-2 text-sm bg-neutral-700 border border-neutral-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 时间筛选 */}
          <div className="space-y-3 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={options.byHour}
                onCheckedChange={handleCheckboxChange('byHour')}
                disabled={disabled}
                id="hour-filter"
              />
              <label
                htmlFor="hour-filter"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer text-white"
              >
                <Clock className="h-4 w-4 text-green-300" />
                按小时筛选
              </label>
            </div>
            {options.byHour && (
              <div className="pl-6 space-y-3">
                <div className="text-sm text-white">
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
          <div className="space-y-3 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={options.byAngle}
                onCheckedChange={handleCheckboxChange('byAngle')}
                disabled={disabled}
                id="angle-filter"
              />
              <label
                htmlFor="angle-filter"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer text-white"
              >
                <Video className="h-4 w-4 text-purple-300" />
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

        {/* 黑色主题统计面板 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-neutral-800 rounded-lg border border-neutral-700">
          <div className="text-center group">
            <div className="text-3xl font-bold text-white">{scannedCount}</div>
            <div className="text-xs text-neutral-400 mt-1">已扫描文件</div>
          </div>
          <div className="text-center group">
            <div className={`text-3xl font-bold ${filteredCount > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {filteredCount}
            </div>
            <div className="text-xs text-neutral-400 mt-1">符合条件</div>
          </div>
          <div className="col-span-2 lg:col-span-1 lg:text-center">
            <div className="text-xs text-neutral-400 mb-2">当前筛选条件</div>
            <Badge className="text-xs bg-white text-black border-neutral-600">
              {getFilterSummary()}
            </Badge>
          </div>
        </div>

        {/* 黑色主题扫描按钮 */}
        <div className="pt-6 border-t border-neutral-700">
          <Button
            onClick={onScanFiles}
            disabled={!sourceDir || disabled}
            className="w-full font-bold cursor-pointer py-3"
            size="lg"
            variant="default"
          >
            <Search className="mr-2 h-5 w-5" />
            <Video className="mr-2 h-5 w-5" />
            开始扫描视频文件
          </Button>
        </div>

        {/* 提示信息 */}
        {scannedCount > 0 && filteredCount === 0 && (
          <div className="flex items-start gap-3 p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
            <div className="p-1 bg-orange-500 rounded">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">没有找到符合条件的文件</div>
              <div className="text-xs text-neutral-400 mt-1">请调整筛选条件或检查文件命名格式</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterOptions;
