<template>
  <main class="dashboard-page">
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">{{ t('admin.eyebrow') }}</p>
          <h1>{{ t('admin.title') }}</h1>
        </div>
        <div class="header-actions">
          <span class="status-pill" :class="`status-${data?.warehouseStatus.lastStatus ?? 'never_run'}`">
            {{ warehouseStatusLabel }}
          </span>
          <button type="button" class="icon-button secondary" @click="refreshData" :disabled="loading">
            <RefreshCw :size="18" />
            {{ t('admin.refresh') }}
          </button>
          <button
            type="button"
            class="icon-button primary"
            @click="runEtl"
            :disabled="refreshingWarehouse"
          >
            <DatabaseZap :size="18" />
            {{ t('admin.sync') }}
          </button>
        </div>
      </header>

      <div v-if="!isAdmin && !authLoading" class="state-panel">
        {{ t('admin.onlyAdmins') }}
      </div>

      <div v-else-if="error" class="state-panel error-panel">{{ error }}</div>
      <div v-else-if="loading && !data" class="state-panel">{{ t('admin.loadingMetrics') }}</div>

      <template v-else-if="data">
        <section class="kpi-grid">
          <article v-for="metric in metrics" :key="metric.label" class="kpi-card">
            <component :is="metric.icon" :size="22" class="kpi-icon" />
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </article>
        </section>

        <section class="insights-band">
          <div class="insight-block">
            <span>{{ t('admin.topBrand') }}</span>
            <strong>{{ data.summary.topBrand ?? t('common.noData') }}</strong>
          </div>
          <div class="insight-block">
            <span>{{ t('admin.topVehicle') }}</span>
            <strong>{{ data.summary.topVehicle ?? t('common.noData') }}</strong>
          </div>
          <div class="insight-block">
            <span>{{ t('admin.lastSync') }}</span>
            <strong>{{ formatDateTime(data.warehouseStatus.lastRunAt) }}</strong>
          </div>
        </section>

        <section class="charts-grid">
          <article class="chart-panel wide-panel">
            <div class="panel-heading">
              <h2>{{ t('admin.interactionsByDate') }}</h2>
              <LineChart :size="18" />
            </div>
            <div class="chart-frame">
              <canvas ref="timelineCanvas"></canvas>
            </div>
          </article>

          <article class="chart-panel">
            <div class="panel-heading">
              <h2>{{ t('admin.brandPopularity') }}</h2>
              <BarChart3 :size="18" />
            </div>
            <div class="chart-frame">
              <canvas ref="brandCanvas"></canvas>
            </div>
          </article>

          <article class="chart-panel">
            <div class="panel-heading">
              <h2>{{ t('admin.typePreference') }}</h2>
              <PieChart :size="18" />
            </div>
            <div class="chart-frame">
              <canvas ref="typeCanvas"></canvas>
            </div>
          </article>
        </section>

        <section class="tables-grid">
          <article class="table-panel">
            <div class="panel-heading">
              <h2>{{ t('admin.topVehicles') }}</h2>
              <CarFront :size="18" />
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{{ t('admin.model') }}</th>
                    <th>{{ t('admin.brand') }}</th>
                    <th>{{ t('admin.type') }}</th>
                    <th>{{ t('admin.score') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vehicle in topVehicles" :key="vehicle.vehicleKey">
                    <td>{{ vehicle.model }}</td>
                    <td>{{ vehicle.brandName ?? t('admin.noBrand') }}</td>
                    <td>{{ vehicle.type ?? t('admin.noType') }}</td>
                    <td>{{ formatNumber(vehicle.popularityScore) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="table-panel">
            <div class="panel-heading">
              <h2>{{ t('admin.userActivity') }}</h2>
              <Users :size="18" />
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{{ t('admin.user') }}</th>
                    <th>{{ t('admin.views') }}</th>
                    <th>{{ t('admin.favorites') }}</th>
                    <th>{{ t('admin.credits') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in activeUsers" :key="user.userKey">
                    <td>{{ user.email ?? user.name ?? t('admin.userWithoutEmail') }}</td>
                    <td>{{ user.totalViews }}</td>
                    <td>{{ user.totalFavorites }}</td>
                    <td>{{ user.totalCreditSimulations }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section class="credit-band">
          <div>
            <span>{{ t('admin.creditSimulations') }}</span>
            <strong>{{ formatNumber(data.creditSimulations.totalSimulations) }}</strong>
          </div>
          <div>
            <span>{{ t('admin.averageVehicle') }}</span>
            <strong>{{ formatCurrency(data.creditSimulations.averageVehiclePrice) }}</strong>
          </div>
          <div>
            <span>{{ t('admin.averageFinancedAmount') }}</span>
            <strong>{{ formatCurrency(data.creditSimulations.averageFinancedAmount) }}</strong>
          </div>
          <div>
            <span>{{ t('admin.averageMonthlyPayment') }}</span>
            <strong>{{ formatCurrency(data.creditSimulations.averageMonthlyPayment) }}</strong>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  BarChart3,
  CarFront,
  DatabaseZap,
  Eye,
  GitCompare,
  Heart,
  LineChart,
  PieChart,
  RefreshCw,
  Users,
  WalletCards,
} from 'lucide-vue-next';
import {
  type DashboardData,
  useAdminDashboard,
} from '../composables/useAdminDashboard';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../i18n';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

const { isAdmin, loading: authLoading } = useAuth();
const { loadDashboard, runWarehouseEtl, loading, refreshingWarehouse, error } = useAdminDashboard();
const { t, locale } = useI18n();

const data = ref<DashboardData | null>(null);
const timelineCanvas = ref<HTMLCanvasElement | null>(null);
const brandCanvas = ref<HTMLCanvasElement | null>(null);
const typeCanvas = ref<HTMLCanvasElement | null>(null);

let timelineChart: Chart | null = null;
let brandChart: Chart | null = null;
let typeChart: Chart | null = null;

const palette = {
  ink: '#1d2733',
  blue: '#2563eb',
  cyan: '#0891b2',
  rose: '#e11d48',
  amber: '#d97706',
  green: '#059669',
  gray: '#64748b',
};

const metrics = computed(() => {
  if (!data.value) return [];

  return [
    { label: t('admin.totalUsers'), value: formatNumber(data.value.summary.totalUsers), icon: Users },
    { label: t('admin.totalVehicles'), value: formatNumber(data.value.summary.totalVehicles), icon: CarFront },
    { label: t('admin.views'), value: formatNumber(data.value.summary.totalViews), icon: Eye },
    { label: t('admin.favorites'), value: formatNumber(data.value.summary.totalFavorites), icon: Heart },
    { label: t('admin.comparisons'), value: formatNumber(data.value.summary.totalComparisons), icon: GitCompare },
    {
      label: t('admin.credits'),
      value: formatNumber(data.value.summary.totalCreditSimulations),
      icon: WalletCards,
    },
  ];
});

const warehouseStatusLabel = computed(() => {
  const status = data.value?.warehouseStatus.lastStatus;
  if (status === 'success') return t('admin.warehouseUpdated');
  if (status === 'error') return t('admin.warehouseError');
  return t('admin.warehousePending');
});

const topVehicles = computed(() => data.value?.vehiclePopularity.slice(0, 8) ?? []);
const activeUsers = computed(() => data.value?.userActivity.slice(0, 8) ?? []);

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);
const intlLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'es-CO'));

const formatNumber = (value: string | number | null | undefined) =>
  new Intl.NumberFormat(intlLocale.value, { maximumFractionDigits: 0 }).format(toNumber(value));

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat(intlLocale.value, {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(toNumber(value));

const formatDateTime = (value: string | null) => {
  if (!value) return t('admin.noRuns');
  return new Date(value).toLocaleString(intlLocale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const refreshData = async () => {
  if (!isAdmin.value) return;
  const dashboard = await loadDashboard();
  if (dashboard) {
    data.value = dashboard;
    await nextTick();
    renderCharts();
  }
};

const runEtl = async () => {
  await runWarehouseEtl();
  await refreshData();
};

const destroyCharts = () => {
  timelineChart?.destroy();
  brandChart?.destroy();
  typeChart?.destroy();
  timelineChart = null;
  brandChart = null;
  typeChart = null;
};

const renderCharts = () => {
  if (!data.value) return;
  destroyCharts();

  if (timelineCanvas.value) {
    timelineChart = new Chart(timelineCanvas.value, {
      type: 'line',
      data: {
        labels: data.value.interactionsOverTime.map((item) =>
          new Date(item.date).toLocaleDateString(intlLocale.value, { month: 'short', day: 'numeric' }),
        ),
        datasets: [
          {
            label: t('admin.views'),
            data: data.value.interactionsOverTime.map((item) => item.totalViews),
            borderColor: palette.blue,
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            fill: true,
            tension: 0.35,
          },
          {
            label: t('admin.favorites'),
            data: data.value.interactionsOverTime.map((item) => item.totalFavorites),
            borderColor: palette.rose,
            backgroundColor: 'rgba(225, 29, 72, 0.08)',
            tension: 0.35,
          },
          {
            label: t('admin.comparisons'),
            data: data.value.interactionsOverTime.map((item) => item.totalComparisons),
            borderColor: palette.amber,
            backgroundColor: 'rgba(217, 119, 6, 0.08)',
            tension: 0.35,
          },
        ],
      },
      options: baseChartOptions(),
    });
  }

  if (brandCanvas.value) {
    const brands = data.value.brandPopularity.slice(0, 8);
    brandChart = new Chart(brandCanvas.value, {
      type: 'bar',
      data: {
        labels: brands.map((brand) => brand.brandName),
        datasets: [
          {
            label: t('admin.score'),
            data: brands.map((brand) => toNumber(brand.popularityScore)),
            backgroundColor: palette.cyan,
            borderRadius: 6,
          },
        ],
      },
      options: baseChartOptions(false),
    });
  }

  if (typeCanvas.value) {
    const types = data.value.vehicleTypePreferences.slice(0, 6);
    typeChart = new Chart(typeCanvas.value, {
      type: 'doughnut',
      data: {
        labels: types.map((item) => item.type),
        datasets: [
          {
            data: types.map((item) => toNumber(item.popularityScore)),
            backgroundColor: [palette.blue, palette.green, palette.amber, palette.rose, palette.cyan, palette.gray],
            borderColor: '#ffffff',
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, color: palette.ink },
          },
        },
      },
    });
  }
};

const baseChartOptions = (showLegend = true) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: showLegend,
      labels: { color: palette.ink, boxWidth: 12 },
    },
  },
  scales: {
    x: {
      ticks: { color: palette.gray, maxRotation: 0 },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: palette.gray },
      grid: { color: 'rgba(100, 116, 139, 0.16)' },
    },
  },
});

onMounted(() => {
  if (!authLoading.value && isAdmin.value) {
    refreshData();
  }
});

watch([authLoading, isAdmin], ([authIsLoading, admin]) => {
  if (!authIsLoading && admin && !data.value) {
    refreshData();
  }
});

watch(locale, () => {
  if (data.value) {
    renderCharts();
  }
});

onUnmounted(destroyCharts);
</script>

<style scoped>
.dashboard-page {
  background: #f3f6f8;
  color: #1d2733;
  min-height: calc(100vh - 80px);
  padding: 32px 20px 48px;
}

.dashboard-shell {
  margin: 0 auto;
  max-width: 1220px;
}

.dashboard-header,
.insights-band,
.credit-band,
.chart-panel,
.table-panel,
.state-panel {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 8px;
}

.dashboard-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
}

.eyebrow {
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  margin-bottom: 6px;
  text-transform: uppercase;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
}

h2 {
  font-size: 1rem;
  font-weight: 800;
}

.header-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.icon-button {
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-weight: 800;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
}

.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.primary {
  background: #1d2733;
  color: #ffffff;
}

.secondary {
  background: #e9eef3;
  color: #1d2733;
}

.status-pill {
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 8px 12px;
}

.status-success {
  background: #dff7ea;
  color: #047857;
}

.status-error {
  background: #fee2e2;
  color: #b91c1c;
}

.status-never_run {
  background: #eef2f7;
  color: #475569;
}

.state-panel {
  margin-top: 18px;
  padding: 24px;
}

.error-panel {
  border-color: #fecaca;
  color: #b91c1c;
}

.kpi-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-top: 18px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 8px;
  min-height: 126px;
  padding: 16px;
}

.kpi-icon {
  color: #2563eb;
  margin-bottom: 16px;
}

.kpi-card span,
.insight-block span,
.credit-band span {
  color: #64748b;
  display: block;
  font-size: 0.82rem;
  font-weight: 800;
}

.kpi-card strong {
  display: block;
  font-size: 1.7rem;
  font-weight: 850;
  margin-top: 4px;
}

.insights-band,
.credit-band {
  display: grid;
  gap: 16px;
  margin-top: 18px;
  padding: 20px 24px;
}

.insights-band {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.credit-band {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.insight-block strong,
.credit-band strong {
  display: block;
  font-size: 1.08rem;
  font-weight: 850;
  margin-top: 4px;
}

.charts-grid,
.tables-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 18px;
}

.wide-panel {
  grid-column: 1 / -1;
}

.chart-panel,
.table-panel {
  padding: 18px;
}

.panel-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-heading svg {
  color: #2563eb;
}

.chart-frame {
  height: 300px;
  min-height: 300px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  min-width: 560px;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 10px;
  text-align: left;
  vertical-align: top;
}

th {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 850;
  text-transform: uppercase;
}

td {
  font-size: 0.92rem;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .dashboard-header,
  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .kpi-grid,
  .insights-band,
  .credit-band,
  .charts-grid,
  .tables-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.65rem;
  }
}
</style>
