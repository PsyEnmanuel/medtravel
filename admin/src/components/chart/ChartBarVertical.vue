<template>
  <div :id="name" :style="{ height: '500px', width: '100%' }" />
</template>

<script setup>
import * as echarts from 'echarts';
import { inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps({ data: Object, title: String, name: String, subtitle: String })
import generateGradient from 'src/data/colors'
const colors = generateGradient(Object.keys(props.data).length)

const $isDesktop = inject('$isDesktop')

function onInit() {

  const chartDom = document.getElementById(props.name);
  const myChart = echarts.init(chartDom);

  const config = {
    data: [],
    legend: []
  }


  let i = 0;
  for (const key in props.data) {
    if (props.data.hasOwnProperty(key)) {
      const value = props.data[key];

      config.data.push({
        value: value.length,
        name: t(key),
        itemStyle: {
          color: colors[i],
        }
      });

      config.legend.push(t(key));
    }
    i++
  }

  const option = {
    title: {
      text: props.title,
      subtext: props.subtitle,
      left: 'center',
      top: $isDesktop ? 20 : 20,
      textStyle: {
        fontSize: $isDesktop ? 22 : 16
      },
      subtextStyle: {
        fontSize: $isDesktop ? 14 : 12
      }
    },
    grid: {
      left: '3%',
      right: 50,
      top: $isDesktop ? 100 : 130,
      containLabel: true,
      height: $isDesktop ? 'auto' : 'auto'
    },
    toolbox: {
      show: true,
      orient: 'horizontal',
      itemSize: $isDesktop ? 25 : 20,
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
