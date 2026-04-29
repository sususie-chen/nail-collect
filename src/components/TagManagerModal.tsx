import { useState } from "react";
import { X, Plus, Trash2, Palette, Wrench } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  "#F43F5E", "#78716C", "#52525B", "#18181B",
  "#FFFFFF", "#FCD34D",
];

const PRESET_FUNCTIONS = [
  "建构", "纯色", "猫眼", "闪粉", "极光",
  "温变", "夜光", "磨砂", "透色", "亮片",
  "珠光", "哑光", "拉丝", "晕染", "彩绘",
];

export default function TagManagerModal({ isOpen, onClose }: TagManagerModalProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#EF4444");
  const [newFunctionName, setNewFunctionName] = useState("");
  const [activeTab, setActiveTab] = useState<"color" | "function">("color");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const utils = trpc.useUtils();
  const { data: tags = [] } = trpc.tag.list.useQuery();
  const createTag = trpc.tag.create.useMutation({
    onSuccess: () => {
      utils.tag.list.invalidate();
      utils.product.list.invalidate();
    },
  });
  const deleteTag = trpc.tag.delete.useMutation({
    onSuccess: () => {
      utils.tag.list.invalidate();
      utils.product.list.invalidate();
    },
  });

  if (!isOpen) return null;

  const colorTags = tags.filter((t) => t.type === "color");
  const functionTags = tags.filter((t) => t.type === "function");

  const handleAddColorTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    createTag.mutate({
      name: newColorName.trim(),
      type: "color",
      colorHex: newColorHex,
    });
    setNewColorName("");
  };

  const handleAddFunctionTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunctionName.trim()) return;
    createTag.mutate({
      name: newFunctionName.trim(),
      type: "function",
    });
    setNewFunctionName("");
  };

  const addPresetFunction = (name: string) => {
    if (functionTags.some((t) => t.name === name)) return;
    createTag.mutate({ name, type: "function" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">标签管理</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("color")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "color"
                ? "border-pink-400 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Palette className="w-4 h-4" />
            色系
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {colorTags.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("function")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "function"
                ? "border-purple-400 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Wrench className="w-4 h-4" />
            功能
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {functionTags.length}
            </span>
          </button>
        </div>

        <div className="p-5">
          {activeTab === "color" ? (
            <div className="space-y-4">
              {/* 添加色系标签 */}
              <form onSubmit={handleAddColorTag} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm"
                      style={{ backgroundColor: newColorHex }}
                    />
                    {showColorPicker && (
                      <div className="absolute top-12 left-0 z-10 bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-64">
                        <div className="grid grid-cols-7 gap-1.5">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setNewColorHex(color);
                                setShowColorPicker(false);
                              }}
                              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                                newColorHex === color
                                  ? "border-gray-900 scale-110"
                                  : "border-gray-200"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="输入色系名称（如：正红、裸色...）"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <button
                    type="submit"
                    disabled={!newColorName.trim() || createTag.isPending}
                    className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* 色系标签列表 */}
              <div className="space-y-2 max-h-80 overflow-auto">
                {colorTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: tag.colorHex || "#ccc" }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {tag.name}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTag.mutate({ id: tag.id })}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {colorTags.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    还没有色系标签，添加一个吧
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 添加功能标签 */}
              <form onSubmit={handleAddFunctionTag} className="flex gap-2">
                <input
                  type="text"
                  value={newFunctionName}
                  onChange={(e) => setNewFunctionName(e.target.value)}
                  placeholder="输入功能名称（如：猫眼、温变...）"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="submit"
                  disabled={!newFunctionName.trim() || createTag.isPending}
                  className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* 预设功能标签 */}
              <div>
                <span className="text-xs text-gray-500 mb-2 block">快速添加</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_FUNCTIONS.map((name) => {
                    const exists = functionTags.some((t) => t.name === name);
                    return (
                      <button
                        key={name}
                        onClick={() => addPresetFunction(name)}
                        disabled={exists}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                          exists
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
                        }`}
                      >
                        {exists ? "✓ " : "+ "}
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 功能标签列表 */}
              <div className="space-y-2 max-h-60 overflow-auto">
                {functionTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {tag.name}
                    </span>
                    <button
                      onClick={() => deleteTag.mutate({ id: tag.id })}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {functionTags.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    还没有功能标签，添加一个吧
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
