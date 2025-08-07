<template>
  <div :id="name" :style="{ height: `500px`, width: '100%' }" />
</template>

<script setup>
import * as echarts from 'echarts';
import { inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const props = defineProps({ data: Object, title: String, name: String, subtitle: String, from: String, to: String })
const $isDesktop = inject('$isDesktop')

function onInit() {
  const chartDom = document.getElementById(props.name);
  const myChart = echarts.init(chartDom);

  const config = {
    data: [],
    legend: [],
    subtitle: `${props.subtitle}`
  }

  for (const key in props.data) {
    if (Object.hasOwnProperty.call(props.data, key)) {
      const dat = props.data[key];
      config.data.push({
        value: dat.count,
        name: dat.description,
      });
      config.legend.push(dat.description);
    }
  }

  const option = {
    title: {
      text: props.title,
      subtext: config.subtitle,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 12
      },
      subtextStyle: {
        fontSize: 14
      }
    },
    grid: {
      left: '3%',
      right: 50,
      top: $isDesktop ? 100 : 130,
      containLabel: true,
      height: $isDesktop ? 'auto' : 'auto'
    },
    legend: {
      top: "bottom",
    },
    tooltip: {
      trigger: "item",
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        restore: { show: true },
        saveAsImage: { show: true, show: true, title: "Descargar" },
      },
    },
    series: [
      {
        name: props.title,
        data: config.data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        type: "pie",
        roseType: "area",
        smooth: true,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
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
