<template>
  <div class="card" :id="title" :style="{ height: `300px`, width: '100%' }" />
</template>

<script setup>
import * as echarts from 'echarts';
import { inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import generateGradient from 'src/data/colors'
const { t } = useI18n()
const props = defineProps({
  hideLegend: {
    type: Boolean,
    default: false
  },
  data: Object, title: String, name: String, subtitle: String, value: String, label: String, currency: Boolean, nolabel: Boolean, legendTruncate: {
    type: Boolean,
    default: true
  }
})
const $isDesktop = inject('$isDesktop')
const colors = generateGradient(props.data.length)
const $currency = inject('$currency')
function onInit() {
  const chartDom = document.getElementById(props.title);
  const myChart = echarts.init(chartDom);
  const config = {
    data: [],
    legend: []
  }

  for (let i = 0; i < props.data.length; i++) {
    const dat = props.data[i];

    config.data.push({
      value: dat[props.value],
      name: t(dat[props.name].toUpperCase()),
      itemStyle: {
        color: colors[i],
      }
    })
    config.legend.push(dat[props.value])
  }

  const option = {
    title: {
      text: props.title.toUpperCase(),
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 12,
      },
      subtextStyle: {
        fontSize: 11
      }
    },
    grid: {
      left: '100%',
      right: '10%',
      top: '30%',
      bottom: '10%',
      height: '275px'
    },
    tooltip: {
      trigger: 'item',
      itemStyle: {
        fontSize: 12,
      },
      formatter: (context) => {
        if (props.currency) {
          return `<b>${t(context.seriesName)}</b><br>${$currency(context.data.value)}`
        } else {
          return `<b>${t(context.seriesName)}</b><br>${context.data.value}`
        }
      },
    },
    legend: props.hideLegend ? undefined: {
      orient: 'vertical',
      bottom: '0',
      right: '0',
      show: $isDesktop,
      fontSize: 8,
      textStyle: {
        width: '100px',
        overflow: props.legendTruncate ? 'truncate' : '',
        fontSize: 8,
      },
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: props.title,
        data: config.data,
        center: $isDesktop ? [props.hideLegend ? '50%': '30%', '50%'] : ['50%', '50%'],
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
          show: true,
          padding: 2,
          borderRadius: 12,
          fontSize: 8
          // formatter: (context) => {
          //   if (props.currency) {
          //     return $currency(context.data.value)
          //   } else {
          //     return context.data.value
          //   }
          // },
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
