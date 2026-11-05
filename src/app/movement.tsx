import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listCategories } from '@/api/categories';
import { createMovement, deleteMovement, getMovement, updateMovement } from '@/api/movements';
import type { Category, CreditCard, Currency, Kind, Movement, PaymentMethod } from '@/api/types';
import { StatusView } from '@/components/StatusView';
import { useToast } from '@/components/Toast';
import { Button, Chip, Field, Segmented } from '@/components/ui';
import { useFetch } from '@/hooks/useFetch';
import { fonts, makeStyles } from '@/theme';
import { CREDIT_CARDS, PAYMENT_METHODS, todayISO } from '@/utils/format';

type Form = {
  kind: Kind;
  amount: string;
  currency: Currency;
  description: string;
  date: string;
  categoryId: number | null;
  paymentMethod: PaymentMethod | null;
  creditCard: CreditCard | null;
  beneficiary: string;
  notes: string;
  shared: boolean;
};

const emptyForm = (): Form => ({
  kind: 'expense',
  amount: '',
  currency: 'ARS',
  description: '',
  date: todayISO(),
  categoryId: null,
  paymentMethod: null,
  creditCard: null,
  beneficiary: '',
  notes: '',
  shared: false,
});

const fromMovement = (m: Movement): Form => ({
  kind: m.kind,
  amount: Number(m.amount).toString().replace('.', ','),
  currency: m.currency,
  description: m.description,
  date: m.date,
  categoryId: m.category_id,
  paymentMethod: m.payment_method,
  creditCard: m.credit_card,
  beneficiary: m.beneficiary ?? '',
  notes: m.notes ?? '',
  shared: m.shared,
});

// "1.234,56" → 1234.56 · "8500" → 8500 · "12.99" → 12.99
function parseAmount(text: string) {
  const t = text.trim().replace(/\s|\$/g, '');
  if (t.includes(',')) return Number(t.replace(/\./g, '').replace(',', '.'));
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ''));
  return Number(t);
}

export default function MovementScreen() {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : null;

  const fetchCategories = useCallback(() => listCategories(), []);
  const categories = useFetch(fetchCategories);

  const [form, setForm] = useState<Form | null>(id ? null : emptyForm());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMovement(id)
      .then((m) => setForm(fromMovement(m)))
      .catch((e: Error) => setLoadError(e.message));
  }, [id]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!form) return <StatusView loading={!loadError} error={loadError} onRetry={close} />;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm({ ...form, [key]: value });

  const ofKind = (categories.data ?? []).filter((c) => c.kind === form.kind);
  const roots = ofKind.filter((c) => c.parent_id == null);
  const selected = ofKind.find((c) => c.id === form.categoryId);
  const rootId = selected ? (selected.parent_id ?? selected.id) : null;
  const subs = ofKind.filter((c) => rootId != null && c.parent_id === rootId);

  const save = async () => {
    const amount = parseAmount(form.amount);
    if (!(amount > 0)) return setError('Ingresá un monto mayor a 0.');
    if (!form.description.trim()) return setError('Ingresá una descripción.');
    if (form.paymentMethod === 'credit_card' && !form.creditCard) return setError('Elegí la tarjeta.');

    const input = {
      kind: form.kind,
      amount,
      currency: form.currency,
      description: form.description.trim(),
      date: form.date,
      category_id: form.categoryId,
      payment_method: form.paymentMethod,
      credit_card: form.paymentMethod === 'credit_card' ? form.creditCard : null,
      beneficiary: form.beneficiary.trim() || null,
      notes: form.notes.trim() || null,
      shared: form.shared,
    };

    setSaving(true);
    setError(null);
    try {
      if (id) await updateMovement(id, input);
      else await createMovement(input);
      toast(id ? 'Movimiento actualizado' : 'Movimiento guardado');
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await deleteMovement(id);
      toast('Movimiento borrado');
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo borrar');
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[s.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <View style={s.modal}>
        <View style={s.head}>
          <Text style={s.title}>{id ? 'Editar movimiento' : 'Nuevo movimiento'}</Text>
          <Segmented
            value={form.kind}
            onChange={(kind) => setForm({ ...form, kind, categoryId: null })}
            options={[
              { value: 'expense', label: 'Gasto' },
              { value: 'income', label: 'Ingreso' },
            ]}
          />
        </View>

        <View style={s.row}>
          <Field
            label="Monto"
            style={s.grow}
            value={form.amount}
            onChangeText={(v) => set('amount', v)}
            keyboardType="decimal-pad"
            placeholder="8.500"
            autoFocus={!id}
          />
          <View style={s.group}>
            <Text style={s.label}>Moneda</Text>
            <Segmented
              value={form.currency}
              onChange={(v) => set('currency', v)}
              options={[
                { value: 'ARS', label: 'ARS' },
                { value: 'USD', label: 'USD' },
              ]}
            />
          </View>
        </View>

        <View style={s.row}>
          <Field
            label="Descripción"
            style={s.grow}
            value={form.description}
            onChangeText={(v) => set('description', v)}
            placeholder="Compra semanal"
          />
          <Field
            label="Fecha"
            style={s.date}
            value={form.date}
            onChangeText={(v) => set('date', v)}
            placeholder="AAAA-MM-DD"
          />
        </View>

        <View style={s.group}>
          <Text style={s.label}>Categoría</Text>
          {categories.error ? (
            <Text style={s.muted}>No se pudieron cargar las categorías.</Text>
          ) : roots.length === 0 ? (
            <Text style={s.muted}>{categories.loading ? 'Cargando…' : 'No hay categorías de este tipo.'}</Text>
          ) : (
            <View style={s.chips}>
              {roots.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  selected={rootId === c.id}
                  onPress={() => set('categoryId', rootId === c.id ? null : c.id)}
                />
              ))}
            </View>
          )}
          {subs.length > 0 && (
            <View style={[s.chips, s.subChips]}>
              {subs.map((c: Category) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  selected={form.categoryId === c.id}
                  onPress={() => set('categoryId', form.categoryId === c.id ? rootId : c.id)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={s.group}>
          <Text style={s.label}>Medio de pago</Text>
          <View style={s.chips}>
            {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => (
              <Chip
                key={method}
                label={PAYMENT_METHODS[method]}
                selected={form.paymentMethod === method}
                onPress={() => set('paymentMethod', form.paymentMethod === method ? null : method)}
              />
            ))}
          </View>
          {form.paymentMethod === 'credit_card' && (
            <View style={[s.chips, s.subChips]}>
              {(Object.keys(CREDIT_CARDS) as CreditCard[]).map((card) => (
                <Chip
                  key={card}
                  label={CREDIT_CARDS[card]}
                  selected={form.creditCard === card}
                  onPress={() => set('creditCard', card)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={s.row}>
          <Field
            label={form.kind === 'income' ? 'Quién pagó (opcional)' : 'A quién (opcional)'}
            style={s.grow}
            value={form.beneficiary}
            onChangeText={(v) => set('beneficiary', v)}
          />
          <Field label="Notas (opcional)" style={s.grow} value={form.notes} onChangeText={(v) => set('notes', v)} />
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.shared }}
          onPress={() => set('shared', !form.shared)}
          style={s.check}
        >
          <View style={[s.box, form.shared && s.boxOn]}>{form.shared && <Text style={s.tick}>✓</Text>}</View>
          <Text style={s.checkText}>Compartido</Text>
        </Pressable>

        {error && <Text style={s.error}>{error}</Text>}

        <View style={s.actions}>
          {id ? (
            confirmDelete ? (
              <View style={s.actionGroup}>
                <Button label="Sí, borrar" variant="danger" small onPress={remove} disabled={saving} />
                <Button label="No" variant="ghost" small onPress={() => setConfirmDelete(false)} />
              </View>
            ) : (
              <Button label="Borrar" variant="linkDanger" onPress={() => setConfirmDelete(true)} />
            )
          ) : (
            <View />
          )}
          <View style={s.actionGroup}>
            <Button label="Cancelar" variant="ghost" onPress={close} />
            <Button label={saving ? 'Guardando…' : 'Guardar'} onPress={save} disabled={saving} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  screen: { flexGrow: 1, paddingHorizontal: 16, backgroundColor: c.bg },
  modal: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.line,
    padding: 20,
    gap: 16,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  title: { fontFamily: fonts.display, fontSize: 20, color: c.ink },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' },
  grow: { flexGrow: 1, flexBasis: 180 },
  date: { flexBasis: 130, flexGrow: 0 },
  group: { gap: 6 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: c.muted },
  muted: { fontFamily: fonts.body, fontSize: 13.5, color: c.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subChips: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: c.accentSoft, marginTop: 4 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: c.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.accent, borderColor: c.accent },
  tick: { color: c.accentInk, fontSize: 12, lineHeight: 14 },
  checkText: { fontFamily: fonts.body, fontSize: 14, color: c.ink2 },
  error: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: c.danger,
    backgroundColor: c.dangerSoft,
    borderRadius: 9,
    padding: 10,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  actionGroup: { flexDirection: 'row', gap: 8 },
}));
