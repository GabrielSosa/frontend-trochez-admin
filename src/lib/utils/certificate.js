import { ApiUrls, apiFetch } from '$lib/api.js';
import { showError, showInfo } from '$lib/utils/toast.js';

/**
 * Open the appraisal certificate in a new window — handles both the HTML and PDF
 * variants returned by `certificates-appraisal` and falls back to a download when
 * the popup blocker kicks in. The behaviour matches the original handler that
 * lived inline in every page; do not change it without verifying print works.
 */
export async function printCertificate(avaluoId) {
  try {
    const response = await apiFetch(ApiUrls.CERTIFICADOS.get(avaluoId));
    if (!response.ok) {
      let errMsg = `Error ${response.status}`;
      try {
        const j = await response.json();
        errMsg = j.detail || j.message || errMsg;
      } catch {
        /* ignore */
      }
      throw new Error(errMsg);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/pdf')) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const newWin = window.open(url, '_blank');
      if (!newWin) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado_${avaluoId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showInfo('El certificado se está descargando. Revisa tu carpeta de descargas.');
      }
      return;
    }

    const htmlText = await response.text();
    if (htmlText.trimStart().startsWith('{')) {
      try {
        const j = JSON.parse(htmlText);
        throw new Error(j.detail || j.message || 'Error al generar el certificado');
      } catch (e) {
        if (!(e instanceof SyntaxError)) throw e;
      }
    }
    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.open();
      newWin.document.write(htmlText);
      newWin.document.close();
      newWin.onload = () => newWin.print();
      setTimeout(() => {
        try {
          newWin.print();
        } catch (_) {
          /* ignore */
        }
      }, 800);
    } else {
      const blob = new Blob([htmlText], { type: 'text/html; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado_${avaluoId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showInfo('El certificado se descargó. Ábrelo en el navegador y usa Imprimir → Guardar como PDF.');
    }
  } catch (error) {
    showError(`Error al obtener el certificado: ${error.message}`);
  }
}
