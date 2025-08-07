<template>
  <div :id="name" :style="{ height: '500px', width: '100%' }" />
</template>

<script setup>
import * as echarts from 'echarts';
import { inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps({ data: Object, title: String, name: String, subtitle: String })
const $isDesktop = inject('$isDesktop')

function onInit() {

  const chartDom = document.getElementById(props.name);
  const myChart = echarts.init(chartDom);

  const config = {
    data: [],
    legend: []
  }



  for (let i = 0; i < props.data.length; i++) {
    const dat = props.data[i];
    config.data.push({
      value: dat.value,
      name: dat.label,
    })
    config.legend.push(dat.value)
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
        type: 'bar',
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
            return context.value.length
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
