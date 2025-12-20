'use client';

import { Card, Empty } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

export default function EncuestasPage() {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Empty
          image={<ToolOutlined style={{ fontSize: 80, color: '#FFCC00' }} />}
          styles={{ image: { height: 120 } }}
          description={
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, marginBottom: 8, color: '#FFFFFF' }}>
                🚧 En Construcción
              </h2>
              <p style={{ fontSize: 16, color: '#A0A0A0' }}>
                Esta sección estará disponible próximamente.
                <br />
                Podrás participar en encuestas de satisfacción y retroalimentación.
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
}
