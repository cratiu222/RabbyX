import { ledgerUSBVendorId } from '@ledgerhq/devices';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';

export enum LedgerHDPathType {
  LedgerLive = 'LedgerLive',
  Legacy = 'Legacy',
  BIP44 = 'BIP44',
  Default = 'Default',
}

export const LedgerHDPathTypeLabel = {
  [LedgerHDPathType.LedgerLive]: 'Ledger Live',
  [LedgerHDPathType.BIP44]: 'BIP44',
  [LedgerHDPathType.Legacy]: 'Legacy',
  [LedgerHDPathType.Default]: 'Default',
};

const hidDevicesAtom = atom<any[]>([]);

export function useHIDDevices() {
  const [devices, setDevices] = useAtom(hidDevicesAtom);
  const isFetchingRef = React.useRef(false);

  const fetchDevices = useCallback(() => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    window.rabbyDesktop.ipcRenderer
      .invoke('get-hid-devices')
      .then((res: any) => {
        if (res?.error) {
          return;
        }
        setDevices(res?.devices);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [setDevices]);

  useEffect(() => {
    fetchDevices();

    return window.rabbyDesktop.ipcRenderer.on(
      '__internal_push:webusb:events',
      (event) => {
        switch (event.eventType) {
          case 'change-detected': {
            fetchDevices();
            break;
          }
          case 'push-hiddevice-list': {
            setDevices(event.deviceList);
            break;
          }
        }
      }
    );
  }, [fetchDevices]);

  return {
    isFetchingDevice: isFetchingRef.current,
    devices,
    fetchDevices,
  };
}

export const useLedgerDeviceConnected = () => {
  const [connected, setConnected] = useState(false);
  const { devices } = useHIDDevices();

  useEffect(() => {
    const hasLedger = devices.some(
      (item) => item.vendorId === ledgerUSBVendorId
    );

    if (hasLedger) {
      setConnected(true);
    } else {
      setConnected(false);
    }
  }, [devices]);

  return connected;
};
