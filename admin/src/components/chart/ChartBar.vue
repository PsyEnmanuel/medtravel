<template>
  <div :id="name" :style="{ height: `${(state.count * 70) + 200}px`, width: '100%' }" />
</template>

<script setup>
import * as echarts from 'echarts';
import { inject, nextTick, onMounted, reactive } from 'vue';
const props = defineProps({ data: Object, title: String, name: String, subtitle: String })

const $isDesktop = inject('$isDesktop')

const state = reactive({
  count: Object.keys(props.data).length
})

function onInit() {

  const chartDom = document.getElementById(props.name);
  const myChart = echarts.init(chartDom);

  const config = {
    data: [],
    legend: []
  }

  for (const key in props.data) {
    if (Object.hasOwnProperty.call(props.data, key)) {
      const y = props.data[key]
      config.data.push({
        value: y,
        name: key,
        itemStyle: {
          color: '#FFCC99'
        }
      })
      config.legend.push(`Cant: ${y}`)
    }
  }

  const option = {
    title: {
      text: props.title,
      subtext: props.subtitle,
      left: 'center',
      top: $isDesktop ? 20 : 50,
      textStyle: {
        fontSize: $isDesktop ? 22 : 13
      },
      subtextStyle: {
        fontSize: $isDesktop ? 14 : 11
      }
    },
    grid: {
      left: '3%',
      right: 50,
      top: $isDesktop ? 100 : 130,
      containLabel: true,
      height: $isDesktop ? 'auto' : '375px'
    },
    toolbox: {
      show: true,
      orient: 'horizontal',
      itemSize: 25,
      feature: {
        saveAsImage: {
          pixelRatio: 1.75,
          show: true,
          title: 'Descargar Gráfico'
        }
      }
    },
    visualMap: {
      orient: 'horizontal',
      left: 'center',
      min: 1,
      max: 100,
      text: ['100', '1'],
      dimension: 0,
      inRange: {
        color: ['#65B581', '#FFCE34', '#FD665F']
      }
    },
    yAxis: {
      type: 'category',
      data: config.legend
    },
    xAxis: {
      type: 'value'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: props.title,
        data: config.data,
        type: 'bar',
        smooth: true,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'insideBottomLeft',
          backgroundColor: '#fff',
          padding: 4,
          borderRadius: 4,
          formatter: (context) => {
            return context.name
          },
        },
      }
    ]
  };

  option && myChart.setOption(option);
  window.addEventListener('resize', function () {
    myChart.resize();
  });
}

onMounted(() => {
  nextTick(() => {
    onInit()
  })
})
</script>
