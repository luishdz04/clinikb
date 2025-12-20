'use client';

import { ConfigProvider, App } from 'antd';
import esES from 'antd/locale/es_ES';
import type { ReactNode } from 'react';
import { antdTheme } from '@/theme';

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider theme={antdTheme} locale={esES}>
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
