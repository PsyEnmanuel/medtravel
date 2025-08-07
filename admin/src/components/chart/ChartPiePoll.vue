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
    name: {
      type: String,
      default: "chart",
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
      function getName(key) {
        if (key == 1) {
          return `Not very`;
        }
        if (key == 2) {
          return `Slightly`;
        }
        if (key == 3) {
          return `Moderately`;
        }
        if (key == 4) {
          return `Very`;
        }
        if (key == 5) {
          return `Very much`;
        }
      }
      console.log(this.name)
      for (const key in this.data) {
        if (Object.hasOwnProperty.call(this.data, key)) {
          const dat = this.data[key];
          
          config.data.push({
            value: dat,
            name: getName(key),
          });
          config.legend.push(getName(key));
        }
      }

      var option = {
        title: {
          text: this.title,
          subtext: this.subtitle,
          left: "center",
          textStyle: {
            fontSize: this.media.xs ? 13 : 22,
          },
          subtextStyle: {
            fontSize: this.media.xs ? 11 : 14,
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
        grid: {
          bottom: 20,
        },
        series: [
          {
            name: this.name,
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "40",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: config.data,
          },
        ],
      };

      option && this.myChart.setOption(option);
    },
  },
};
</script>

