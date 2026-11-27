/**
 * Cliente da Rosi: renderiza a conversa e liga os botões. Carregado sob demanda pelo botão.
 * Todo texto (do sistema ou do visitante) entra com textContent, nunca com innerHTML.
 */
import { texts } from '../../data/rosi';
import { buildContext } from '../../lib/rosi/context';
import {
  createState,
  expectsText,
  handoffHref,
  optionsFor,
  orderHref,
  placeholderFor,
  respond,
  startWithEquipment,
  summaryLines,
  type Option,
  type RosiState,
} from '../../lib/rosi/engine';
import { getOpenStatus } from '../../lib/openStatus';
import { buildWhatsAppLink, GENERAL_MESSAGE } from '../../lib/whatsapp';

const STORAGE_KEY = 'rosi-state';

function loadState(): RosiState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RosiState;
      if (parsed && typeof parsed.step === 'string' && Array.isArray(parsed.messages))
        return parsed;
    }
  } catch {
    // Sem sessionStorage (ou JSON inválido): começa uma conversa nova.
  }
  return createState(buildContext());
}

function saveState(state: RosiState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sem armazenamento, a conversa só dura enquanto a página estiver aberta.
  }
}

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export interface RosiApi {
  open: () => void;
  openWithEquipment: (equipmentId: string) => void;
}

/** Liga a Rosi ao painel. Chamado uma vez; devolve funções para o botão. */
export function mountRosi(root: HTMLElement): RosiApi {
  const dialog = root.querySelector<HTMLDialogElement>('[data-rosi-dialog]');
  const launcher = root.querySelector<HTMLButtonElement>('[data-rosi-open]');
  const messagesEl = root.querySelector<HTMLOListElement>('[data-rosi-messages]');
  const typingEl = root.querySelector<HTMLElement>('[data-rosi-typing]');
  const extraEl = root.querySelector<HTMLElement>('[data-rosi-extra]');
  const optionsEl = root.querySelector<HTMLElement>('[data-rosi-options]');
  const form = root.querySelector<HTMLFormElement>('[data-rosi-form]');
  const input = root.querySelector<HTMLInputElement>('#rosi-input');
  const restartBtn = root.querySelector<HTMLButtonElement>('[data-rosi-restart]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-rosi-close]');
  const statusEl = root.querySelector<HTMLElement>('[data-rosi-status]');
  const whatsEl = root.querySelector<HTMLAnchorElement>('[data-rosi-whats]');
  const bodyEl = root.querySelector<HTMLElement>('.rosi-panel__body');

  if (
    !dialog ||
    !launcher ||
    !messagesEl ||
    !typingEl ||
    !extraEl ||
    !optionsEl ||
    !form ||
    !input
  ) {
    return { open: () => undefined, openWithEquipment: () => undefined };
  }
  // Referências já confirmadas acima, com tipo não nulo para as funções internas.
  const els = { dialog, launcher, messagesEl, typingEl, extraEl, optionsEl, form, input };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state = loadState();
  let typingTimer: number | undefined;

  if (whatsEl) whatsEl.href = buildWhatsAppLink(GENERAL_MESSAGE);

  function updateStatus(): void {
    if (statusEl) statusEl.textContent = getOpenStatus().label;
  }

  function summaryCard(): HTMLElement {
    const ctx = buildContext();
    const card = el('div', 'rosi-card');
    const dl = el('dl');
    for (const line of summaryLines(state, ctx)) {
      if (line.label === 'Equipamentos') {
        dl.append(el('dt', '', line.label));
        const list = el('dd');
        if (state.items.length === 0) list.textContent = 'nenhum';
        for (const item of state.items) {
          const name =
            ctx.equipment.find((e) => e.id === item.equipmentId)?.name ?? item.equipmentId;
          const row = el('div', 'rosi-row');
          row.append(el('span', '', name));
          const minus = el('button', 'rosi-mini', '−');
          minus.type = 'button';
          minus.setAttribute('aria-label', `Diminuir ${name}`);
          minus.addEventListener('click', () =>
            act({ type: 'option', id: `item-:${item.equipmentId}` }),
          );
          const count = el('span', '', String(item.quantity));
          const plus = el('button', 'rosi-mini', '+');
          plus.type = 'button';
          plus.setAttribute('aria-label', `Aumentar ${name}`);
          plus.addEventListener('click', () =>
            act({ type: 'option', id: `item+:${item.equipmentId}` }),
          );
          const trash = el('button', 'rosi-mini', '🗑');
          trash.type = 'button';
          trash.setAttribute('aria-label', `Remover ${name}`);
          trash.addEventListener('click', () =>
            act({ type: 'option', id: `item-del:${item.equipmentId}` }),
          );
          row.append(minus, count, plus, trash);
          list.append(row);
        }
        dl.append(list);
        continue;
      }
      dl.append(el('dt', '', line.label));
      const row = el('dd', 'rosi-row');
      row.append(el('span', '', line.value));
      const edit = el('button', 'rosi-mini', 'Editar');
      edit.type = 'button';
      edit.style.minWidth = '44px';
      edit.setAttribute('aria-label', `Editar ${line.label}`);
      edit.addEventListener('click', () => act({ type: 'option', id: `edit:${line.edit}` }));
      row.append(edit);
      dl.append(row);
    }
    card.append(dl);
    return card;
  }

  function renderExtra(): void {
    els.extraEl.replaceChildren();
    const ctx = buildContext();
    if (state.step === 'summary') {
      els.extraEl.append(summaryCard());
      if (state.items.length > 0) {
        const send = el('a', 'rosi-send-big', 'Enviar pedido no WhatsApp');
        send.href = orderHref(state, ctx);
        send.target = '_blank';
        send.rel = 'noopener noreferrer';
        send.addEventListener('click', () =>
          window.setTimeout(() => act({ type: 'option', id: 'send' }, false), 0),
        );
        els.extraEl.append(send);
      } else {
        els.extraEl.append(el('p', 'rosi-typing', texts.summaryEmpty));
      }
      els.extraEl.append(el('p', 'rosi-typing', texts.summaryNote));
    }
    if (state.step === 'handoff') {
      const link = el('a', 'rosi-send-big', 'Abrir WhatsApp');
      link.href = handoffHref(state);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      els.extraEl.append(link);
    }
    if (state.step === 'sent') {
      const link = el('a', 'rosi-send-big', 'Abrir WhatsApp com o pedido');
      link.href = orderHref(state, ctx);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      els.extraEl.append(link);
    }
  }

  function optionButton(option: Option, summary: boolean): HTMLElement {
    if (option.href) {
      const link = el('a', 'rosi-chip', option.label);
      link.href = option.href;
      return link;
    }
    const button = el('button', 'rosi-chip', option.label);
    button.type = 'button';
    button.addEventListener('click', () => act({ type: 'option', id: option.id }));
    if (summary && option.id === 'add') button.classList.add('rosi-chip--primary');
    return button;
  }

  function render(): void {
    const ctx = buildContext();
    els.messagesEl.replaceChildren(
      ...state.messages.map((message) => {
        const item = el('li');
        item.append(el('p', `rosi-msg rosi-msg--${message.from}`, message.text));
        return item;
      }),
    );
    renderExtra();
    const options = optionsFor(state, ctx).filter((o) => o.id !== 'send');
    els.optionsEl.replaceChildren(...options.map((o) => optionButton(o, state.step === 'summary')));
    els.input.placeholder = placeholderFor(state);
    els.input.setAttribute(
      'aria-label',
      expectsText(state) ? placeholderFor(state) : 'Digite sua dúvida',
    );
    if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  /** Aplica a ação. Com `typing`, mostra "Rosi está digitando…" antes de renderizar. */
  function act(action: Parameters<typeof respond>[1], typing = true): void {
    state = respond(state, action, buildContext());
    saveState(state);
    if (!typing || reduceMotion) {
      render();
      return;
    }
    els.typingEl.hidden = false;
    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
      els.typingEl.hidden = true;
      render();
    }, 450);
  }

  els.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = els.input.value.trim();
    if (!text) return;
    els.input.value = '';
    act({ type: 'text', text });
  });

  restartBtn?.addEventListener('click', () => {
    state = respond(state, { type: 'restart' }, buildContext());
    saveState(state);
    render();
  });
  closeBtn?.addEventListener('click', () => els.dialog.close());

  els.dialog.addEventListener('click', (event) => {
    if (event.target === els.dialog) els.dialog.close();
  });
  els.dialog.addEventListener('close', () => els.launcher.focus());

  function open(): void {
    updateStatus();
    if (!els.dialog.open) els.dialog.showModal();
    render();
    const first = els.optionsEl.querySelector<HTMLElement>('button, a') ?? input;
    first?.focus();
  }

  function openWithEquipment(equipmentId: string): void {
    state = startWithEquipment(state, equipmentId, buildContext());
    saveState(state);
    open();
  }

  return { open, openWithEquipment };
}
