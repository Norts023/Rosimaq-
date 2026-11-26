/**
 * Diálogos de detalhes (<dialog> nativo).
 * - Abrem pelo botão "Detalhes" ou pela âncora (/equipamentos#id).
 * - Foco inicial no título; Esc fecha; o foco volta ao gatilho.
 */
const triggers = new WeakMap<HTMLDialogElement, HTMLElement | null>();

export function openDialog(dialog: HTMLDialogElement, trigger: HTMLElement | null): void {
  if (!dialog.open) {
    triggers.set(dialog, trigger);
    dialog.showModal();
  }
  dialog.querySelector<HTMLElement>('[data-dialog-title]')?.focus();
  if (dialog.id && location.hash !== `#${dialog.id}`) {
    history.replaceState(null, '', `${location.pathname}${location.search}#${dialog.id}`);
  }
}

export function initDialogs(): void {
  const dialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[data-dialog]'));
  const byId = new Map(dialogs.map((dialog) => [dialog.id, dialog]));

  dialogs.forEach((dialog) => {
    dialog
      .querySelector<HTMLButtonElement>('[data-dialog-close]')
      ?.addEventListener('click', () => dialog.close());
    // Clique no fundo (fora do conteúdo) fecha.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      const trigger = triggers.get(dialog);
      triggers.delete(dialog);
      if (location.hash === `#${dialog.id}`) {
        history.replaceState(null, '', `${location.pathname}${location.search}`);
      }
      trigger?.focus();
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-details]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const dialog = byId.get(link.dataset.details ?? '');
      if (!dialog) return;
      event.preventDefault();
      openDialog(dialog, link);
    });
  });

  const openFromHash = () => {
    const dialog = byId.get(location.hash.slice(1));
    if (dialog && !dialog.open) {
      const trigger = document.querySelector<HTMLElement>(`[data-details="${dialog.id}"]`);
      openDialog(dialog, trigger);
    }
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
}
