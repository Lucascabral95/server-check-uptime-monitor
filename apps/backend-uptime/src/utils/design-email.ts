import { Status } from '@prisma/client';

export interface EmailDesignOptions {
  serverName: string;
  status: Status;
  recipientEmail: string;
}

function getStatusColor(status: Status): string {
  switch (status) {
    case Status.UP: return '#10b981';    
    case Status.DOWN: return '#ef4444';  
    case Status.PENDING: return '#f59e0b'; 
    default: return '#6b7280';          
  }
}

function getStatusText(status: Status): string {
  switch (status) {
    case Status.UP: return 'OPERATIVO';
    case Status.DOWN: return 'CAÍDO';
    case Status.PENDING: return 'PENDIENTE';
    default: return 'DESCONOCIDO';
  }
}

function getStatusIconHtml(status: Status, color: string): string {
  let symbol = '';
  switch (status) {
    case Status.UP: symbol = '&#10003;'; break;
    case Status.DOWN: symbol = '&#33;'; break;     
    case Status.PENDING: symbol = '&#8943;'; break; 
    default: symbol = '?';
  }

  return `
    <div style="
      width: 64px; 
      height: 64px; 
      background-color: ${color}20; 
      border-radius: 50%; 
      line-height: 64px; 
      text-align: center; 
      display: inline-block;
      margin-bottom: 20px;
    ">
      <span style="font-size: 32px; color: ${color}; font-weight: bold;">
        ${symbol}
      </span>
    </div>`;
}

export function generateNotificationEmailHtml(options: EmailDesignOptions): string {
  const { serverName, status, recipientEmail } = options;
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);
  const statusIcon = getStatusIconHtml(status, statusColor);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualización de estado</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1a202c; font-family: sans-serif;">

  <table role="presentation" width="100%" style="background-color: #1a202c; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #2d3748; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #4a5568;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Server Check App</h1>
            </td>
          </tr>

          <!-- Status Icon & Text -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              ${statusIcon}
              <p style="margin: 0; color: #a0aec0; font-size: 14px; text-transform: uppercase;">Estado actual</p>
              <h2 style="margin: 10px 0 0 0; color: ${statusColor}; font-size: 32px;">${statusText}</h2>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" style="background-color: #1a202c; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #2d3748;">
                    <p style="color: #718096; font-size: 12px; margin: 0;">SERVIDOR</p>
                    <p style="color: #ffffff; font-size: 18px; margin: 5px 0 0 0; font-weight: bold;">${serverName}</p>
                  </td>
                </tr>
                 <tr>
                  <td style="padding: 20px;">
                    <p style="color: #718096; font-size: 12px; margin: 0;">NOTIFICADO A</p>
                    <p style="color: #ffffff; font-size: 16px; margin: 5px 0 0 0;">${recipientEmail}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #1a202c; text-align: center; color: #4a5568; font-size: 12px;">
              © 2026 Server Check App
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
