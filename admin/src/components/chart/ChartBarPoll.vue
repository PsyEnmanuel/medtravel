<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import * as echarts from "echarts";
import { mapGetters } from "vuex";
import { markRaw } from "vue";
export default {
  props: {
    currency: {
      type: Boolean,
      default: false,
    },
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "700px",
    },
    data: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: "",
    },
    subtitle: {
      type: String,
      required: false,
      default: "",
    },
    dataZoom: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      myChart: null,
      series: [],
    };
  },
  watch: {
    data: {
      handler(val, oldVal) {
        this.initChart();
      },
    },
  },
  mounted() {
    this.initChart();
    const observer = new ResizeObserver((entries) => {
      this.myChart.resize();
    });
    observer.observe(this.$el);
  },
  computed: {
    ...mapGetters(["media"]),
  },
  methods: {
    initChart() {
      this.myChart = markRaw(echarts.init(this.$el));
      this.series = [];

      const config = {
        data: [],
        legend: [],
      };

      for (const key in this.data) {
        if (Object.hasOwnProperty.call(this.data, key)) {
          const dat = this.data[key];
          config.data.push({
            value: dat.count,
            name: dat.description,
          });
          config.legend.push(dat.description);
        }
      }
      var option = {
        title: {
          text: this.title,
          subtext: this.subtitle,
          left: "center",
          textStyle: {
            fontSize: this.media.xs ? 12 : 14,
          },
          subtextStyle: {
            fontSize: this.media.xs ? 11 : 12,
          },
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
            saveAsImage: { show: true, show: true, title: "Descargar" },
          },
        },
        xAxis: {
          type: "category",
          data: config.data.map((i) => i.name),
          show: false,
        },
        yAxis: {
          type: "value",
        },
        grid: {
          bottom: 20
        },
        series: [
          {
            itemStyle: {
              color: "#deceae"
            },
            data: config.data.map((i) => i.value),
            type: "bar",
            showBackground: true,
            backgroundStyle: {
              color: "rgba(180, 180, 180, 0.2)",
            },
            label: {
              show: true,
              rotate: 90,
              align: "left",
              verticalAlign: "middle",
              position: "insideBottom",
              distance: 15,
              color: "black",
              fontSize: "14px",
              fontFamily: "Poppins",
              formatter(ctx) {
                return `${ctx.name}. ${ctx.value}`;
              },
            },
          },
        ],
      };

      option && this.myChart.setOption(option);
    },
  },
};
</script>

