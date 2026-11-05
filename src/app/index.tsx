import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { checkHealth } from '@/api/client';
import { listMovements } from '@/api/movements';
import type { Kind, Movement } from '@/api/types';
import { HBar } from '@/components/HBar';
import { Kpi } from '@/components/Kpi';
import { MovementItem } from '@/components/MovementItem';
import { StatusView } from '@/components/StatusView';
import { Button, Card, CardHeader, Chip, Segmented } from '@/components/ui';
import { useFetch } from '@/hooks/useFetch';
import { fonts, makeStyles } from '@/theme';
import { addMonths, currentMonth, fmtMoney, monthLabel, totalsByCurrency } from '@/utils/format';

type Tab = 'inicio' | 'movimientos';
type KindFilter = 'all' | Kind;

const UNCATEGORIZED = 'Sin categoría';

export default function HomeScreen() {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const narrow = width < 720;

  const [tab, setTab] = useState<Tab>('inicio');
  const [month, setMonth] = useState(currentMonth);
  const [kind, setKind] = useState<KindFilter>('all');
  const [category, setCategory] = useState<string | null>(null);

  const health = useFetch(checkHealth);
  const fetchMonth = useCallback(() => listMovements({ month }), [month]);
  const { data, error, loading, reload } = useFetch(fetchMonth);

  // Refetch when coming back from the movement modal (skip the first focus, useFetch already loads).
  const focused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focused.current) reload();
      focused.current = true;
    }, [reload]),
  );

  const changeMonth = (n: number) => {
    setMonth((m) => addMonths(m, n));
    setCategory(null);
  };

  const openMovement = (id?: number) =>
    router.push(id ? { pathname: '/movement', params: { id } } : '/movement');

  const showCategory = (name: string) => {
    setCategory(name);
    setKind('expense');
    setTab('movimientos');
  };

  return (
    <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 64 + insets.bottom }}>
      <View style={[s.top, { paddingTop: insets.top + 12 }]}>
        <View style={s.topIn}>
          <View style={s.brandRow}>
            <View style={s.brandMark}>
              <Text style={s.brandMarkText}>$</Text>
            </View>
            <Text style={s.brand}>Libreta</Text>
            <View style={s.status}>
              <View style={[s.dot, health.data ? s.dotOk : health.error ? s.dotError : null]} />
              {!narrow && <Text style={s.statusText}>{health.data ? 'Conectado' : health.error ? 'Sin conexión' : 'Conectando…'}</Text>}
            </View>
            <Button label="+ Agregar" small onPress={() => openMovement()} />
          </View>

          <View style={s.monthNav}>
            <Pressable accessibilityLabel="Mes anterior" style={s.iconBtn} onPress={() => changeMonth(-1)}>
              <Text style={s.iconBtnText}>‹</Text>
            </Pressable>
            <Text style={[s.h1, narrow && { fontSize: 22 }]}>{monthLabel(month)}</Text>
            <Pressable accessibilityLabel="Mes siguiente" style={s.iconBtn} onPress={() => changeMonth(1)}>
              <Text style={s.iconBtnText}>›</Text>
            </Pressable>
          </View>

          <View style={s.tabs} accessibilityRole="tablist">
            {(['inicio', 'movimientos'] as Tab[]).map((t) => (
              <Pressable
                key={t}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === t }}
                onPress={() => setTab(t)}
                style={[s.tab, tab === t && s.tabSelected]}
              >
                <Text style={[s.tabText, tab === t && s.tabTextSelected]}>
                  {t === 'inicio' ? 'Inicio' : 'Movimientos'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={s.wrap}>
        {error || !data ? (
          <StatusView loading={loading} error={error} onRetry={reload} />
        ) : tab === 'inicio' ? (
          <Overview
            movements={data}
            narrow={narrow}
            onCategory={showCategory}
            onOpen={openMovement}
            onSeeAll={() => setTab('movimientos')}
          />
        ) : (
          <MovementsList
            movements={data}
            kind={kind}
            category={category}
            onKind={(k) => {
              setKind(k);
              setCategory(null);
            }}
            onCategory={setCategory}
            onOpen={openMovement}
          />
        )}
      </View>
    </ScrollView>
  );
}

type OverviewProps = {
  movements: Movement[];
  narrow: boolean;
  onCategory: (name: string) => void;
  onOpen: (id?: number) => void;
  onSeeAll: () => void;
};

function Overview({ movements, narrow, onCategory, onOpen, onSeeAll }: OverviewProps) {
  const s = useStyles();
  const totals = totalsByCurrency(movements);
  const ars = totals.ARS ?? { income: 0, expense: 0 };
  const usd = totals.USD;

  const byCategory = useMemo(() => {
    const sums = new Map<string, number>();
    for (const m of movements) {
      if (m.kind !== 'expense' || m.currency !== 'ARS') continue;
      const name = m.category ?? UNCATEGORIZED;
      sums.set(name, (sums.get(name) ?? 0) + Number(m.amount));
    }
    return [...sums.entries()].sort((a, b) => b[1] - a[1]);
  }, [movements]);
  const maxCategory = byCategory[0]?.[1] ?? 0;

  if (movements.length === 0) return <EmptyState onAdd={() => onOpen()} />;

  const kpiStyle = narrow ? s.kpiHalf : s.kpiFlex;

  return (
    <View style={s.section}>
      <View style={s.kpis}>
        <Kpi
          hero
          label="Balance del mes"
          value={fmtMoney(ars.income - ars.expense)}
          sub={ars.income ? `${Math.round((ars.expense / ars.income) * 100)}% de los ingresos gastado` : 'Sin ingresos en pesos'}
          style={narrow ? s.kpiFull : s.kpiHero}
        />
        <Kpi label="Ingresos" value={fmtMoney(ars.income)} style={kpiStyle} />
        <Kpi label="Gastos" value={fmtMoney(ars.expense)} style={kpiStyle} />
        {usd && (
          <Kpi
            label="En dólares"
            value={fmtMoney(usd.expense, 'USD')}
            sub={usd.income ? `gastos · ingresos ${fmtMoney(usd.income, 'USD')}` : 'gastos'}
            style={kpiStyle}
          />
        )}
      </View>

      <View style={[s.grid2, narrow && s.grid1]}>
        <Card style={narrow ? undefined : s.gridItem}>
          <CardHeader title="Gastos por categoría" />
          {byCategory.length === 0 ? (
            <Text style={s.muted}>No hay gastos en pesos este mes.</Text>
          ) : (
            <View style={s.hbars}>
              {byCategory.map(([name, value]) => (
                <HBar
                  key={name}
                  label={name}
                  value={value}
                  max={maxCategory}
                  share={ars.expense ? value / ars.expense : 0}
                  onPress={() => onCategory(name)}
                />
              ))}
            </View>
          )}
        </Card>

        <Card style={narrow ? undefined : s.gridItem}>
          <CardHeader title="Últimos movimientos" action={<Button label="Ver todos" variant="link" onPress={onSeeAll} />} />
          {movements.slice(0, 5).map((m, i) => (
            <MovementItem key={m.id} movement={m} first={i === 0} onPress={() => onOpen(m.id)} />
          ))}
        </Card>
      </View>
    </View>
  );
}

type ListProps = {
  movements: Movement[];
  kind: KindFilter;
  category: string | null;
  onKind: (kind: KindFilter) => void;
  onCategory: (name: string | null) => void;
  onOpen: (id?: number) => void;
};

function MovementsList({ movements, kind, category, onKind, onCategory, onOpen }: ListProps) {
  const s = useStyles();
  const ofKind = kind === 'all' ? movements : movements.filter((m) => m.kind === kind);
  const categories = [...new Set(ofKind.map((m) => m.category ?? UNCATEGORIZED))].sort();
  const visible = category ? ofKind.filter((m) => (m.category ?? UNCATEGORIZED) === category) : ofKind;

  if (movements.length === 0) return <EmptyState onAdd={() => onOpen()} />;

  return (
    <View style={s.section}>
      <View style={s.filters}>
        <Segmented
          value={kind}
          onChange={onKind}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'expense', label: 'Gastos' },
            { value: 'income', label: 'Ingresos' },
          ]}
        />
        <View style={s.chips}>
          <Chip label="Todas" selected={!category} onPress={() => onCategory(null)} />
          {categories.map((name) => (
            <Chip key={name} label={name} selected={category === name} onPress={() => onCategory(name)} />
          ))}
        </View>
      </View>

      <Card>
        {visible.length === 0 ? (
          <Text style={s.muted}>No hay movimientos con estos filtros.</Text>
        ) : (
          visible.map((m, i) => <MovementItem key={m.id} movement={m} first={i === 0} onPress={() => onOpen(m.id)} />)
        )}
        <View style={s.tfoot}>
          <Text style={s.tfootText}>{visible.length} movimientos</Text>
          <Text style={s.tfootText}>
            {Object.entries(totalsByCurrency(visible))
              .map(([cur, t]) => fmtMoney(t.income - t.expense, cur as Movement['currency']))
              .join(' · ')}
          </Text>
        </View>
      </Card>
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const s = useStyles();
  return (
    <Card>
      <View style={s.empty}>
        <Text style={s.h2}>Todavía no anotaste nada este mes</Text>
        <Text style={s.emptyText}>Cargá un gasto o un ingreso y acá vas a ver el balance y en qué se va la plata.</Text>
        <Button label="Anotar el primero" onPress={onAdd} small />
      </View>
    </Card>
  );
}

const useStyles = makeStyles((c) => ({
  top: { backgroundColor: c.bg, borderBottomWidth: 1, borderBottomColor: c.line },
  topIn: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 16, gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 28, height: 28, borderRadius: 8, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: c.accentInk, fontFamily: fonts.displayBold, fontSize: 15 },
  brand: { fontFamily: fonts.displayBold, fontSize: 20, color: c.ink, letterSpacing: -0.4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto', marginRight: 4 },
  statusText: { fontFamily: fonts.body, fontSize: 12, color: c.muted },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.muted },
  dotOk: { backgroundColor: c.good },
  dotError: { backgroundColor: c.danger },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: c.ink, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.display, fontSize: 18, color: c.ink, textAlign: 'center' },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20, lineHeight: 22, color: c.ink2 },
  tabs: { flexDirection: 'row', gap: 2, marginBottom: -1 },
  tab: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabSelected: { borderBottomColor: c.accent },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: c.muted },
  tabTextSelected: { color: c.ink },
  wrap: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 20 },
  section: { gap: 16 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiHero: { flexGrow: 1.5, flexBasis: 0 },
  kpiFlex: { flexGrow: 1, flexBasis: 0 },
  kpiFull: { width: '100%' },
  kpiHalf: { flexGrow: 1, flexBasis: '40%' },
  grid2: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  grid1: { flexDirection: 'column', alignItems: 'stretch' },
  gridItem: { flex: 1 },
  hbars: { gap: 9 },
  muted: { fontFamily: fonts.body, fontSize: 14, color: c.muted },
  filters: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tfoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  tfootText: { fontFamily: fonts.body, fontSize: 13.5, color: c.ink2, fontVariant: ['tabular-nums'] },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  emptyText: { fontFamily: fonts.body, fontSize: 15, color: c.ink2, textAlign: 'center', maxWidth: 420 },
}));
