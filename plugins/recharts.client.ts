import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('ResponsiveContainer', ResponsiveContainer)
    nuxtApp.vueApp.component('LineChart', LineChart)
    nuxtApp.vueApp.component('Line', Line)
    nuxtApp.vueApp.component('XAxis', XAxis)
    nuxtApp.vueApp.component('YAxis', YAxis)
    nuxtApp.vueApp.component('CartesianGrid', CartesianGrid)
    nuxtApp.vueApp.component('Tooltip', Tooltip)
    nuxtApp.vueApp.component('Legend', Legend)
    nuxtApp.vueApp.component('PieChart', PieChart)
    nuxtApp.vueApp.component('Pie', Pie)
})
