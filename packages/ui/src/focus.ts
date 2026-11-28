// Focus return for controlled Radix dialogs (NF-30, brief §13). Radix returns focus to its own
// <Dialog.Trigger>; our sheets and dialogs are opened by the app's buttons (or by code: a scan
// result), so there is no Trigger and focus would fall to <body>. This records what had focus as
// the dialog opens (Radix fires onOpenAutoFocus before moving focus in) and restores it on close.
import { useRef } from 'react';

export function useReturnFocus() {
  const previous = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      previous.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    },
    onCloseAutoFocus: (event: Event) => {
      const target = previous.current;
      if (target?.isConnected === true) {
        event.preventDefault();
        target.focus();
      }
    },
  };
}
