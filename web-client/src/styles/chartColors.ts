// 跟 styles/tokens.css 里的 --series-* 保持一致（ECharts 配置是纯 JS 对象，读不了 CSS 变量，只能手动同步）
// 这 6 个颜色是一套设计好、互相协调的色板（蓝/青/琥珀/紫/青绿/灰蓝）。
// 规则：不同图表可以用不同的下标来区分主题（比如房贷用紫色、定存用琥珀色），
// 但都要从这一套色板里选，不要为了"求变化"临时挑一个不相关的颜色——那是第一版显得杂乱的原因。
// 全部单系列图表都用 seriesColors[0] 又会太单调，所以现在按图表主题分配不同下标，
// 具体对照见各组件内的注释。多系列图表（比如6个城市对比）就直接顺序用完整这套色板。
export const seriesColors = [
  '#2563eb', '#0891b2', '#d97706', '#7c3aed', '#0d9488', '#64748b'
]

// 每个 seriesColors 对应的浅→深竖直渐变（柱状图专用，折线图还是用 seriesColors 的纯色，
// 渐变描边容易糊）。目的：单一扁平色柱看起来太"廉价"，加一点纵向层次感更像正经仪表盘的图表。
// 直接写成 ECharts LinearGradient 需要的纯对象结构，不用额外 import echarts。
function verticalGradient(topColor: string, bottomColor: string) {
  return {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{ offset: 0, color: topColor }, { offset: 1, color: bottomColor }]
  }
}
// 横向柱状图（RegionalComparisonChart 这种 city 在 y 轴、数值在 x 轴的）渐变方向要跟着转 90 度
function horizontalGradient(leftColor: string, rightColor: string) {
  return {
    type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
    colorStops: [{ offset: 0, color: leftColor }, { offset: 1, color: rightColor }]
  }
}

export const seriesGradients = [
  verticalGradient('#93c5fd', '#2563eb'),
  verticalGradient('#67e8f9', '#0891b2'),
  verticalGradient('#fcd34d', '#d97706'),
  verticalGradient('#c4b5fd', '#7c3aed'),
  verticalGradient('#5eead4', '#0d9488'),
  verticalGradient('#cbd5e1', '#64748b'),
]
export const seriesGradientsHorizontal = [
  horizontalGradient('#93c5fd', '#2563eb'),
  horizontalGradient('#67e8f9', '#0891b2'),
  horizontalGradient('#fcd34d', '#d97706'),
  horizontalGradient('#c4b5fd', '#7c3aed'),
  horizontalGradient('#5eead4', '#0d9488'),
  horizontalGradient('#cbd5e1', '#64748b'),
]