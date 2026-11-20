import { useSyncExternalStore } from "react";

type Listener = () => void;

let isOpen = false;
const listeners = new Set<Listener>();

export const isMobileMenuOpen = () => isOpen;

export const setMobileMenuOpen = (value: boolean) => {
  if (isOpen === value) return;
  isOpen = value;
  listeners.forEach((l) => l());
};

const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useMobileMenuOpen = () =>
  useSyncExternalStore(subscribe, isMobileMenuOpen, () => false);
