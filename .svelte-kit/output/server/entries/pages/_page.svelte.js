import { o as onDestroy, c as create_ssr_component, f as spread, g as add_attribute, h as escape_object, v as validate_component } from "../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/state.svelte.js";
import { Chart as Chart$1, LineController, PieController, BarController, registerables } from "chart.js";
import { N as Navbar } from "../../chunks/Navbar.js";
const eventPrefix = /^on/;
const events = [];
Object.keys(globalThis).forEach((key) => {
  if (eventPrefix.test(key)) {
    events.push(key.replace(eventPrefix, ""));
  }
});
function useForwardEvents(getRef) {
  const destructors = [];
  onDestroy(() => {
    while (destructors.length) {
      destructors.pop()();
    }
  });
}
function clean(props2) {
  let { data: data2, type: type2, options: options2, plugins: plugins2, children, $$scope, $$slots, ...rest } = props2;
  return rest;
}
const Chart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type } = $$props;
  let { data = { datasets: [] } } = $$props;
  let { options = {} } = $$props;
  let { plugins = [] } = $$props;
  let { updateMode = void 0 } = $$props;
  let { chart = null } = $$props;
  let canvasRef;
  let props = clean($$props);
  onDestroy(() => {
    if (chart) chart.destroy();
    chart = null;
  });
  useForwardEvents();
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.options === void 0 && $$bindings.options && options !== void 0) $$bindings.options(options);
  if ($$props.plugins === void 0 && $$bindings.plugins && plugins !== void 0) $$bindings.plugins(plugins);
  if ($$props.updateMode === void 0 && $$bindings.updateMode && updateMode !== void 0) $$bindings.updateMode(updateMode);
  if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0) $$bindings.chart(chart);
  return `<canvas${spread([escape_object(props)], {})}${add_attribute("this", canvasRef, 0)}></canvas>`;
});
const Line = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  Chart$1.register(LineController);
  let { chart = null } = $$props;
  let props;
  let baseChartRef;
  useForwardEvents();
  if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0) $$bindings.chart(chart);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    props = $$props;
    $$rendered = `${validate_component(Chart, "Chart").$$render(
      $$result,
      Object.assign({}, { type: "line" }, props, { this: baseChartRef }, { chart }),
      {
        this: ($$value) => {
          baseChartRef = $$value;
          $$settled = false;
        },
        chart: ($$value) => {
          chart = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const Pie = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  Chart$1.register(PieController);
  let { chart = null } = $$props;
  let props;
  let baseChartRef;
  useForwardEvents();
  if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0) $$bindings.chart(chart);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    props = $$props;
    $$rendered = `${validate_component(Chart, "Chart").$$render(
      $$result,
      Object.assign({}, { type: "pie" }, props, { this: baseChartRef }, { chart }),
      {
        this: ($$value) => {
          baseChartRef = $$value;
          $$settled = false;
        },
        chart: ($$value) => {
          chart = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const Bar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  Chart$1.register(BarController);
  let { chart = null } = $$props;
  let props;
  let baseChartRef;
  useForwardEvents();
  if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0) $$bindings.chart(chart);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    props = $$props;
    $$rendered = `${validate_component(Chart, "Chart").$$render(
      $$result,
      Object.assign({}, { type: "bar" }, props, { this: baseChartRef }, { chart }),
      {
        this: ($$value) => {
          baseChartRef = $$value;
          $$settled = false;
        },
        chart: ($$value) => {
          chart = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  Chart$1.register(...registerables);
  let user = null;
  let dailySalesData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        label: "Ventas del día",
        data: [12500, 15e3, 8700, 9800, 14500, 18e3, 11200],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }
    ]
  };
  let monthlySalesData = {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic"
    ],
    datasets: [
      {
        label: "Ventas del mes",
        data: [
          85e3,
          92e3,
          78e3,
          105e3,
          12e4,
          98e3,
          115e3,
          125e3,
          95e3,
          11e4,
          13e4,
          145e3
        ],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.4
      }
    ]
  };
  let topCarsData = {
    labels: [
      "Toyota Hilux",
      "Honda CR-V",
      "Toyota Corolla",
      "Nissan Frontier",
      "Hyundai Tucson"
    ],
    datasets: [
      {
        label: "Carros con más avalúos",
        data: [48, 42, 37, 32, 28],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)"
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)"
        ],
        borderWidth: 1
      }
    ]
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Ventas del Día" }
    }
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Ventas Mensuales" }
    }
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Carros con Más Avalúos"
      }
    }
  };
  return `<div class="min-h-screen bg-gray-50"> ${validate_component(Navbar, "Navbar").$$render($$result, { user }, {}, {})}  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><h1 class="text-2xl font-bold text-gray-800 mb-6" data-svelte-h="svelte-m7kkm0">Dashboard</h1>  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-svelte-h="svelte-sv5sf0"><div class="bg-white rounded-lg shadow p-6"><h2 class="text-lg font-semibold text-gray-700 mb-2">Total Avalúos</h2> <p class="text-3xl font-bold text-blue-600">187</p> <p class="text-sm text-gray-500 mt-1">+12% vs. mes anterior</p></div> <div class="bg-white rounded-lg shadow p-6"><h2 class="text-lg font-semibold text-gray-700 mb-2">Ingresos Totales</h2> <p class="text-3xl font-bold text-green-600">$1,245,000</p> <p class="text-sm text-gray-500 mt-1">+8% vs. mes anterior</p></div> <div class="bg-white rounded-lg shadow p-6"><h2 class="text-lg font-semibold text-gray-700 mb-2">Clientes Nuevos</h2> <p class="text-3xl font-bold text-purple-600">32</p> <p class="text-sm text-gray-500 mt-1">+15% vs. mes anterior</p></div></div>  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"><div class="bg-white rounded-lg shadow p-6">${validate_component(Bar, "Bar").$$render(
    $$result,
    {
      data: dailySalesData,
      options: barOptions
    },
    {},
    {}
  )}</div> <div class="bg-white rounded-lg shadow p-6">${validate_component(Line, "Line").$$render(
    $$result,
    {
      data: monthlySalesData,
      options: lineOptions
    },
    {},
    {}
  )}</div></div> <div class="grid grid-cols-1 gap-6"><div class="bg-white rounded-lg shadow p-6"><div class="max-w-md mx-auto">${validate_component(Pie, "Pie").$$render($$result, { data: topCarsData, options: pieOptions }, {}, {})}</div></div></div></main></div>`;
});
export {
  Page as default
};
