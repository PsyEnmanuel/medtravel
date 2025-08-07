<template>
  <div :id="name" :style="{ height: `500px`, width: '100%' }" />
</template>

<script setup>
import * as echarts from 'echarts';
import { inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps({ data: Object, title: String, name: String, subtitle: String, from: String, to: String })
import generateGradient from 'src/data/colors'
const colors = generateGradient(Object.keys(props.data).length)
const $isDesktop = inject('$isDesktop')

function onInit() {
  const chartDom = document.getElementById(props.name);
  const myChart = echarts.init(chartDom);

  const config = {
    data: [],
    legend: [],
    subtitle: `${props.subtitle}`
  }

  if ((props.from && props.to) && props.from === props.to) {
    config.subtitle += ` ${props.from}`
  } else if (props.from && props.to) {
    config.subtitle += ` (${props.from} - ${props.to})`
  } else if (props.from) {
    config.subtitle += ` ${props.from}`
  } else if (props.to) {
    config.subtitle += ` ${props.to}`
  }

  let i = 0;
  for (const key in props.data) {
    if (Object.hasOwnProperty.call(props.data, key)) {
      const y = props.data[key]

      config.data.push({
        value: y,
        name: t(key.toUpperCase()),
        itemStyle: {
          color: colors[i],
        }
      })
      config.legend.push(y)
      i++
    }
  }

  const option = {
    title: {
      text: props.title.toUpperCase(),
      subtext: config.subtitle.toUpperCase(),
      left: 'center',
      top: $isDesktop ? 20 : 20,
      textStyle: {
        fontSize: $isDesktop ? 22 : 16,
        textTransform: 'uppercase'
      },
      subtextStyle: {
        fontSize: $isDesktop ? 14 : 12,
        textTransform: 'uppercase'
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
    legend: {
      bottom: '5%',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: props.title,
        data: config.data,
        type: 'pie',
        radius: ['40%', '70%'],
        smooth: true,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: $isDesktop ? true : false,
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
  onInit()
})
</script>
