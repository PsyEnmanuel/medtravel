<template>
  <div :id="name" :style="{ height: '500px', width: '100%' }" />
</template>

<script setup>
import * as echarts from 'echarts';
import { inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps({ data: Object, title: String, name: String, subtitle: String, format: Boolean })
const $isDesktop = inject('$isDesktop')

function onInit() {

  const chartDom = document.getElementById(props.name);
  const myChart = echarts.init(chartDom);
  let format = null
  if(props.format) {
    format = `${props.name}_format`
  }

  const config = {
    data: [],
    legend: [],
    series: []
  }

  for (const key in props.data) {
    if (Object.hasOwnProperty.call(props.data, key)) {
      const dat = props.data[key];
      config.data.push({
        value: dat[props.name] ? dat[props.name] : null,
        value_format: dat[format] ? dat[format] : null,
        name: key,
      })
      config.legend.push(key)
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
    yAxis: {
      type: 'value'
    },
    xAxis: {
      type: 'category',
      data: config.legend
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: props.title,
        data: config.data,
        type: 'line',
        barGap: 0,
        smooth: true,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'top',
          backgroundColor: '#fff',
          padding: 4,
          borderRadius: 4,
          formatter: (context) => {
            if(props.format) {
              return context.data.value_format
            } else {
              return context.value
            }
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
  onInit()
})
</script>
