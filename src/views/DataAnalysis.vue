<!-- src/views/DataAnalysis.vue -->
<template>
    <div class="analysis-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="page-title">数据分析</h2>
        <p class="page-subtitle">实时监控业务数据，洞察运营趋势</p>
      </div>
  
      <!-- 数据卡片区域 -->
      <el-row :gutter="24" class="data-cards">
        <el-col :span="6">
          <div class="data-card">
            <div class="card-icon inventory">
              <i class="el-icon-box"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ totalProducts }}</div>
              <div class="card-label">商品种类</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card">
            <div class="card-icon inbound">
              <i class="el-icon-upload"></i>
            </div>
            <div class="card-content">
              <div class="card-value">¥{{ formatNumber(inboundAmount) }}</div>
              <div class="card-label">30天入库</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card">
            <div class="card-icon outbound">
              <i class="el-icon-download"></i>
            </div>
            <div class="card-content">
              <div class="card-value">¥{{ formatNumber(outboundAmount) }}</div>
              <div class="card-label">30天出库</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card">
            <div class="card-icon return">
              <i class="el-icon-refresh-left"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ totalReturns }}</div>
              <div class="card-label">退货记录</div>
            </div>
          </div>
        </el-col>
      </el-row>
  
      <!-- 图表区域 -->
      <el-row :gutter="24" class="chart-section">
        <!-- 库存分布：饼图 -->
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">各产品当前库存</span>
                <el-tag size="small" type="info">实时数据</el-tag>
              </div>
            </template>
            <div class="pie-chart-container">
              <div ref="stockPie" class="pie-chart" v-loading="loading"></div>
              <!-- 独立的图例区域 -->
              <div class="chart-legend" v-if="!loading && stockLegendData.length > 0">
                <div class="legend-title">产品库存明细</div>
                <div class="legend-grid">
                  <div 
                    v-for="(item, index) in stockLegendData" 
                    :key="index"
                    class="legend-item"
                  >
                    <div 
                      class="legend-color" 
                      :style="{ backgroundColor: item.color }"
                    ></div>
                    <div class="legend-info">
                      <div class="legend-name">{{ item.name }}</div>
                      <div class="legend-value">{{ item.value }} 件</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
  
        <!-- 近30天出入库对比：柱状图 -->
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">近30天入库/出库金额</span>
                <el-tag size="small" type="success">趋势分析</el-tag>
              </div>
            </template>
            <div ref="inOutBar" class="chart" v-loading="loading"></div>
          </el-card>
        </el-col>
  
        <!-- 退货状态分布 -->
        <el-col :span="24">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">退货记录状态分布</span>
                <el-tag size="small" type="warning">状态统计</el-tag>
              </div>
            </template>
            <div ref="returnBar" class="chart" v-loading="loading"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import http from '@/api/http'
  
  // DOM 引用
  const stockPie = ref(null)
  const inOutBar = ref(null)
  const returnBar = ref(null)
  
  // 数据状态
  const loading = ref(true)
  const totalProducts = ref(0)
  const inboundAmount = ref(0)
  const outboundAmount = ref(0)
  const totalReturns = ref(0)
  const stockLegendData = ref([])
  
  // 存储图表实例，用于响应式调整
  const charts = []
  
  // 预定义颜色方案
  const colorPalette = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ff9f7f',
    '#87ceeb', '#dda0dd', '#98fb98', '#f0e68c', '#ff6347',
    '#40e0d0', '#ee82ee', '#90ee90', '#ffd700', '#ff69b4'
  ]
  
  onMounted(() => {
    loadAndDraw()
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  })
  
  onUnmounted(() => {
    // 清理图表实例
    charts.forEach(chart => {
      if (chart && !chart.isDisposed()) {
        chart.dispose()
      }
    })
    window.removeEventListener('resize', handleResize)
  })
  
  // 窗口大小变化时调整图表
  function handleResize() {
    charts.forEach(chart => {
      if (chart && !chart.isDisposed()) {
        chart.resize()
      }
    })
  }
  
  async function loadAndDraw() {
    try {
      loading.value = true
      
      /* 1. 并行拉数据 */
      const [
        productsRes,
        inboundsRes,
        outboundsRes,
        returnsRes
      ] = await Promise.all([
        http.get('/products?size=1000'),
        http.get('/inbounds?size=1000'),
        http.get('/outbounds?size=1000'),
        http.get('/return-records?size=1000')
      ])
  
      // 统一把 "数组 / { content:[] } / { records:[] }" 兼容成纯数组
      const getList = (r) => {
        const d = r.data
        return Array.isArray(d) ? d
             : Array.isArray(d.content) ? d.content
             : Array.isArray(d.records) ? d.records
             : []
      }
  
      const products = getList(productsRes)
      const inbounds = getList(inboundsRes)
      const outbounds = getList(outboundsRes)
      const returns = getList(returnsRes)
  
      /* 2. 处理数据 */
      const stockSeries = products
        .filter(p => p.stock > 0)
        .map((p, index) => ({ 
          name: p.name, 
          value: p.stock,
          itemStyle: {
            color: colorPalette[index % colorPalette.length]
          }
        }))
  
      // 生成图例数据
      stockLegendData.value = stockSeries.map((item, index) => ({
        name: item.name,
        value: item.value,
        color: colorPalette[index % colorPalette.length]
      }))
  
      const last30 = list =>
        list.filter(r => Date.now() - new Date(r.createdAt || r.inboundTime || r.outboundTime) < 30*24*3600*1000)
  
      const inAmount = last30(inbounds).reduce((s,r) => s + Number(r.totalAmount || 0), 0)
      const outAmount = last30(outbounds).reduce((s,r) => s + Number(r.totalAmount || 0), 0)
  
      const statusMap = {}
      returns.forEach(r => { statusMap[r.status] = (statusMap[r.status] || 0) + 1 })
  
      // 更新统计数据
      totalProducts.value = products.length
      inboundAmount.value = inAmount
      outboundAmount.value = outAmount
      totalReturns.value = returns.length
  
      /* 3. 画图 */
      await drawPie(stockPie.value, stockSeries)
      await drawBar(inOutBar.value, ['入库','出库'], [inAmount, outAmount])
      await drawReturnBar(returnBar.value, Object.keys(statusMap), Object.values(statusMap))
      
    } catch (error) {
      console.error('数据加载失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  function drawPie(dom, series) {
    if (!dom) return
    
    const chart = echarts.init(dom)
    charts.push(chart)
    
    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} 件 ({d}%)'
      },
      // 移除默认图例，使用自定义图例
      legend: {
        show: false
      },
      series: [{
        name: '库存分布',
        type: 'pie',
        radius: ['25%', '75%'], // 增大饼图半径
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: '{b}\n{c} 件'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: series,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200
        }
      }]
    })
  }
  
  function drawBar(dom, labels, values) {
    if (!dom) return
    
    const chart = echarts.init(dom)
    charts.push(chart)
    
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const param = params[0]
          return `${param.name}: ¥${formatNumber(param.value)}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#e0e6ed'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f0f2f5'
          }
        },
        axisLabel: {
          formatter: function(value) {
            return '¥' + formatNumber(value)
          }
        }
      },
      series: [{
        type: 'bar',
        data: values,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79bbff' }
          ])
        },
        animationDelay: function (idx) {
          return idx * 100
        }
      }]
    })
  }
  
  function drawReturnBar(dom, labels, values) {
    if (!dom) return
    
    const chart = echarts.init(dom)
    charts.push(chart)
    
    const colors = ['#67C23A', '#E6A23C', '#F56C6C', '#909399']
    
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: {
          lineStyle: {
            color: '#e0e6ed'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f0f2f5'
          }
        }
      },
      series: [{
        type: 'bar',
        data: values.map((value, index) => ({
          value,
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [4, 4, 0, 0]
          }
        })),
        animationDelay: function (idx) {
          return idx * 100
        }
      }]
    })
  }
  
  // 数字格式化
  function formatNumber(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
  }
  </script>
  
  <style scoped>
  .analysis-page {
    padding: 24px;
    background: #f5f6fa;
    min-height: calc(100vh - 60px);
    overflow: hidden;
  }
  
  /* 页面标题 */
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: #8590a6;
    margin: 0;
  }
  
  /* 数据卡片 */
  .data-cards {
    margin-bottom: 24px;
  }
  
  .data-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    height: 100px;
  }
  
  .data-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .card-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 24px;
    color: white;
  }
  
  .card-icon.inventory {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .card-icon.inbound {
    background: linear-gradient(135deg, #67B26F 0%, #4ca2cd 100%);
  }
  
  .card-icon.outbound {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    color: #d35400;
  }
  
  .card-icon.return {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #e74c3c;
  }
  
  .card-content {
    flex: 1;
  }
  
  .card-value {
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 4px;
  }
  
  .card-label {
    font-size: 14px;
    color: #8590a6;
  }
  
  /* 图表区域 */
  .chart-section {
    margin-bottom: 24px;
  }
  
  .chart-card {
    border-radius: 12px;
    overflow: hidden;
    border: none;
    margin-bottom: 24px;
    height: 500px; /* 统一卡片高度 */
  }
  
  .chart-card :deep(.el-card__header) {
    background: #fafafa;
    border-bottom: 1px solid #f0f2f5;
    padding: 16px 20px;
  }
  
  .chart-card :deep(.el-card__body) {
    padding: 20px;
    height: calc(100% - 60px); /* 减去header高度 */
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .chart {
    width: 100%;
    height: 100%; /* 占满整个body */
  }
  
  /* 饼图容器 */
  .pie-chart-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .pie-chart {
    width: 100%;
    height: 260px; /* 固定饼图高度 */
    flex-shrink: 0;
  }
  
  /* 自定义图例样式 */
  .chart-legend {
    flex: 1; /* 占满剩余空间 */
    margin-top: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f2f5;
    overflow: hidden;
  }
  
  .legend-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 12px;
    text-align: center;
  }
  
  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
    height: calc(100% - 40px); /* 减去标题高度 */
    overflow-y: auto;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e8eaec;
    transition: all 0.2s ease;
    height: fit-content;
  }
  
  .legend-item:hover {
    border-color: #409EFF;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }
  
  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .legend-info {
    flex: 1;
    min-width: 0;
  }
  
  .legend-name {
    font-size: 12px;
    color: #2c3e50;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }
  
  .legend-value {
    font-size: 11px;
    color: #8590a6;
    line-height: 1.2;
    margin-top: 2px;
  }
  
  /* 响应式设计 */
  @media (max-width: 1200px) {
    .chart-card {
      height: 450px;
    }
    
    .pie-chart {
      height: 220px;
    }
    
    .legend-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
  }
  
  @media (max-width: 768px) {
    .analysis-page {
      padding: 16px;
    }
    
    .data-card {
      padding: 16px;
      height: 80px;
    }
    
    .card-icon {
      width: 40px;
      height: 40px;
      font-size: 20px;
      margin-right: 12px;
    }
    
    .card-value {
      font-size: 20px;
    }
    
    .chart-card {
      height: 380px;
    }
    
    .pie-chart {
      height: 180px;
    }
    
    .legend-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 6px;
    }
    
    .legend-item {
      padding: 4px 6px;
    }
    
    .legend-name {
      font-size: 11px;
    }
    
    .legend-value {
      font-size: 10px;
    }
  }
  
  /* 加载状态优化 */
  :deep(.el-loading-mask) {
    border-radius: 8px;
  }
  
  /* 滚动条样式 */
  .legend-grid::-webkit-scrollbar {
    width: 4px;
  }
  
  .legend-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  
  .legend-grid::-webkit-scrollbar-thumb {
    background: #c1c4cd;
    border-radius: 2px;
  }
  
  .legend-grid::-webkit-scrollbar-thumb:hover {
    background: #a6a9b3;
  }
  </style>